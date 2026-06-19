import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { name, email, cpf, password } = parsed.data

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { cpf }] },
  })

  if (existing) {
    res.status(409).json({ error: 'E-mail ou CPF já cadastrado' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      cpf,
      passwordHash,
      account: {
        create: {
          card: {
            create: {
              last4: Math.floor(1000 + Math.random() * 9000).toString(),
              dueDate: new Date(new Date().setDate(10)),
            },
          },
        },
      },
    },
  })

  const token = signToken({ userId: user.id })
  res.status(201).json({ token })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const token = signToken({ userId: user.id })
  res.json({ token })
}