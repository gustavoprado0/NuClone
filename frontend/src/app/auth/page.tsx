"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

import {
  loginSchema,
  registerSchema,
  LoginInput,
  RegisterInput,
} from "@/lib/validations";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const { setToken, setUser } = useAuthStore();

  // 🔐 LOGIN FORM
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // 🧾 REGISTER FORM
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  // LOGIN
  async function handleLogin(data: LoginInput) {
    try {
      console.log("LOGIN DATA:", data);

      const res = await api.post("/auth/login", data);

      console.log("LOGIN OK:", res.data);

      setToken(res.data.token);
      setUser(res.data.user);

      router.push("/dashboard");
    } catch (err: any) {
      console.log("LOGIN ERROR:", err?.response?.data || err);
    }
  }

  // REGISTER
  async function handleRegister(data: RegisterInput) {
    try {
      console.log("REGISTER DATA:", data);

      const res = await api.post("/auth/register", data);

      console.log("REGISTER OK:", res.data);

      setToken(res.data.token);
      setUser(res.data.user);

      router.push("/dashboard");
    } catch (err: any) {
      console.log("REGISTER ERROR:", err?.response?.data || err);
    }
  }

  function toggleMode() {
    setIsLogin((prev) => !prev);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0014] text-white">
      <div className="w-full max-w-md bg-[#12001f] p-8 rounded-2xl shadow-lg border border-purple-900">

        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Entrar" : "Criar conta"}
        </h1>

        {/* 🔐 LOGIN */}
        {isLogin ? (
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-4"
          >
            <div>
              <input
                {...loginForm.register("email")}
                placeholder="Email"
                className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
              />
              <p className="text-red-400 text-sm">
                {loginForm.formState.errors.email?.message}
              </p>
            </div>

            <div>
              <input
                type="password"
                {...loginForm.register("password")}
                placeholder="Senha"
                className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
              />
              <p className="text-red-400 text-sm">
                {loginForm.formState.errors.password?.message}
              </p>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-purple-700 hover:bg-purple-600 rounded-lg font-semibold"
            >
              Entrar
            </button>
          </form>
        ) : (
          /* 🧾 REGISTER */
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="space-y-4"
          >
            <input
              {...registerForm.register("name")}
              placeholder="Nome"
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <input
              {...registerForm.register("email")}
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <input
              {...registerForm.register("cpf")}
              placeholder="CPF"
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <input
              type="password"
              {...registerForm.register("password")}
              placeholder="Senha"
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <input
              type="number"
              {...registerForm.register("balance", { valueAsNumber: true })}
              placeholder="Saldo inicial"
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <input
              {...registerForm.register("pixKey")}
              placeholder="Chave PIX"
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <input
              type="number"
              {...registerForm.register("cardLimit", { valueAsNumber: true })}
              placeholder="Limite do cartão"
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <input
              type="date"
              {...registerForm.register("cardDueDate")}
              className="w-full p-3 rounded-lg bg-[#1a002b] border border-purple-800"
            />

            <button
              type="submit"
              className="w-full p-3 bg-purple-700 hover:bg-purple-600 rounded-lg font-semibold"
            >
              Criar conta
            </button>
          </form>
        )}

        {/* TOGGLE */}
        <p className="text-center text-sm mt-6 text-gray-400">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}
          <button
            onClick={toggleMode}
            className="ml-2 text-purple-400 hover:underline"
          >
            {isLogin ? "Criar agora" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
}