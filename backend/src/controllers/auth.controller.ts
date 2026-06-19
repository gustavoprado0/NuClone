import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { AuthRequest } from "../middlewares/auth.middleware";


const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(6),
  balance: z.number().min(0),
  pixKey: z.string().min(3),
  cardLimit: z.number().min(0),
  cardDueDate: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const pixSchema = z.object({
  receiverPixKey: z.string().min(3),
  amount: z.coerce.number().positive(),
});


export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const {
    name,
    email,
    cpf,
    password,
    balance,
    pixKey,
    cardLimit,
    cardDueDate,
  } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { cpf }],
    },
  });

  if (existing) {
    return res.status(409).json({ error: "E-mail ou CPF já cadastrado" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      cpf,
      passwordHash,
      account: {
        create: {
          balance,
          pixKey,
          card: {
            create: {
              last4: Math.floor(1000 + Math.random() * 9000).toString(),
              limit: cardLimit,
              usedLimit: 0,
              dueDate: new Date(cardDueDate),
              blocked: false,
            },
          },
        },
      },
    },
    include: {
      account: {
        include: {
          card: true,
        },
      },
    },
  });

  const token = signToken({ userId: user.id });

  return res.status(201).json({
    token,
    user,
  });
}


export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = signToken({ userId: user.id });

  return res.json({ token });
}


export async function getUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        createdAt: true,
        account: {
          select: {
            id: true,
            balance: true,
            pixKey: true,
            card: true,
            sentTransactions: true,
            receivedTransactions: true,
          },
        },
      },
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}



export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      account: {
        select: {
          balance: true,
          pixKey: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  return res.json(user);
}


export async function sendPix(req: AuthRequest, res: Response) {
  const parsed = pixSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const { receiverPixKey, amount } = parsed.data;

  const senderId = req.userId;

  if (!senderId) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const sender = await prisma.account.findFirst({
    where: { userId: senderId },
  });

  const receiver = await prisma.account.findFirst({
    where: { pixKey: receiverPixKey },
  });

  if (!sender || !receiver) {
    return res.status(404).json({ error: "Conta não encontrada" });
  }

  if (sender.balance < amount) {
    return res.status(400).json({ error: "Saldo insuficiente" });
  }

  await prisma.$transaction([
    prisma.account.update({
      where: { id: sender.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    }),
    prisma.account.update({
      where: { id: receiver.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    }),
    prisma.transaction.create({
      data: {
        type: "PIX",
        amount,
        senderId: sender.id,
        receiverId: receiver.id,
      },
    }),
  ]);

  return res.json({
    success: true,
    amount,
  });
}