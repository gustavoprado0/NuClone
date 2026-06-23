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
import { Button } from "@/components/ui/button";

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
      const res = await api.post("/auth/login", data);

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
      const res = await api.post("/auth/register", data);

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
    <div className="flex min-h-screen items-center justify-center bg-[#820AD1] px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 flex justify-center">
          <span className="text-4xl font-extrabold lowercase tracking-tight text-white">
            nu<span className="text-[#C9A6E8]">clone</span>
          </span>
        </div>

        <div className="rounded-[28px] bg-white px-7 py-9 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)]">
          <h1 className="mb-1 text-2xl font-extrabold text-[#1D1929]">
            {isLogin ? "Olá! Que bom te ver." : "Vamos criar sua conta"}
          </h1>
          <p className="mb-7 text-sm text-[#6B6478]">
            {isLogin
              ? "Entre com seu e-mail e senha."
              : "Leva menos de um minuto."}
          </p>

          {isLogin ? (
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-5"
            >
              <FloatingField
                label="E-mail"
                type="email"
                registration={loginForm.register("email")}
                error={loginForm.formState.errors.email?.message}
              />

              <FloatingField
                label="Senha"
                type="password"
                registration={loginForm.register("password")}
                error={loginForm.formState.errors.password?.message}
              />

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-full bg-[#8A05BE] text-base font-semibold text-white hover:bg-[#700A9C] cursor-pointer"
              >
                Entrar
              </Button>
            </form>
          ) : (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-5"
            >
              <FloatingField
                label="Nome completo"
                registration={registerForm.register("name")}
                error={registerForm.formState.errors.name?.message}
              />

              <FloatingField
                label="E-mail"
                type="email"
                registration={registerForm.register("email")}
                error={registerForm.formState.errors.email?.message}
              />

              <FloatingField
                label="CPF"
                registration={registerForm.register("cpf")}
                error={registerForm.formState.errors.cpf?.message}
              />

              <FloatingField
                label="Senha"
                type="password"
                registration={registerForm.register("password")}
                error={registerForm.formState.errors.password?.message}
              />

              <FloatingField
                label="Saldo inicial"
                type="number"
                registration={registerForm.register("balance", {
                  valueAsNumber: true,
                })}
                error={registerForm.formState.errors.balance?.message}
              />

              <FloatingField
                label="Chave Pix"
                registration={registerForm.register("pixKey")}
                error={registerForm.formState.errors.pixKey?.message}
              />

              <FloatingField
                label="Limite do cartão"
                type="number"
                registration={registerForm.register("cardLimit", {
                  valueAsNumber: true,
                })}
                error={registerForm.formState.errors.cardLimit?.message}
              />

              <FloatingField
                label="Vencimento do cartão"
                type="date"
                registration={registerForm.register("cardDueDate")}
                error={registerForm.formState.errors.cardDueDate?.message}
              />

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-full bg-[#8A05BE] text-base font-semibold text-white hover:bg-[#700A9C] cursor-pointer"
              >
                Criar conta
              </Button>
            </form>
          )}
        </div>

        <p className="mt-7 text-center text-sm text-white/80">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-white underline-offset-2 hover:underline cursor-pointer"
          >
            {isLogin ? "Criar agora" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
}

function FloatingField({
  label,
  type = "text",
  registration,
  error,
}: {
  label: string;
  type?: string;
  registration: any;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6B6478]">
        {label}
      </label>
      <input
        type={type}
        {...registration}
        className="w-full border-b-2 border-[#E8DEF0] bg-transparent pb-2 text-[15px] text-[#1D1929] outline-none transition-colors placeholder:text-[#B8AFC4] focus:border-[#8A05BE]"
      />
      {error && <p className="mt-1 text-xs text-[#E5383B]">{error}</p>}
    </div>
  );
}
