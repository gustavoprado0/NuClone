import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(6),
  balance: z.number().min(0),
  pixKey: z.string().min(3),
  cardLimit: z.number().min(0),
  cardDueDate: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
