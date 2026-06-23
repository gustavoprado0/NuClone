"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { CreditCard, ArrowUpRight, ArrowDownLeft, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
  senderId?: string;
  receiverId?: string;
};

type Card_ = {
  id: string;
  last4: string;
  limit: number;
  usedLimit: number;
  dueDate: string;
  blocked: boolean;
  accountId: string;
};

type Account = {
  id: string;
  balance: number;
  pixKey: string;
  userId: string;
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
  card?: Card_;
};

type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  createdAt: string;
  account?: Account;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function initials(name: string) {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const [receiverPixKey, setReceiverPixKey] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const token = useAuthStore((s) => s.token);
  const storedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  // Aguarda a store reidratar do localStorage antes de checar o token
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  const loadData = async () => {
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // O /auth/login do backend não retorna o usuário, só o token.
      // Se a store ainda não tem o usuário, busca via /auth/me.
      let currentUser = storedUser;
      if (!currentUser) {
        const meRes = await api.get<User>("/auth/me", { headers });
        currentUser = meRes.data;
        setUser(meRes.data);
      }

      const usersRes = await api.get<User[]>("/auth/users", { headers });
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
      logout();
      router.push("/auth");
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;

    loadData();

    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, [hydrated, token]);

  const handleBackToLogin = () => {
    logout();
    router.push("/auth");
  };

  async function sendPix() {
    try {
      await api.post(
        "/auth/pix",
        { receiverPixKey, amount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Pix enviado com sucesso!");

      await loadData();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || "Erro ao enviar Pix");
    }
  }

  const loggedUser = users.find((u) => u.id === storedUser?.id);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F2F8]">
        <div className="flex items-center gap-3 text-sm text-[#820AD1]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#820AD1] border-t-transparent" />
          Carregando contas...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2F8] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="w-full">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <p className="text-lg font-medium uppercase tracking-[0.2em] text-[#8A05BE]">
              Minha conta
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            <Input
              placeholder="Chave Pix"
              value={receiverPixKey}
              onChange={(e) => setReceiverPixKey(e.target.value)}
              className="w-full sm:w-44"
            />

            <Input
              placeholder="Valor"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full sm:w-32"
            />

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                onClick={sendPix}
                className="w-full bg-[#8A05BE] text-white hover:bg-[#700A9C] sm:w-auto"
              >
                Enviar Pix
              </Button>
              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="w-full border-[#8A05BE] text-[#8A05BE] hover:bg-[#8A05BE]/10 sm:w-auto"
              >
                Sair
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {loggedUser && (
            <Card
              key={loggedUser.id}
              className="overflow-hidden border-none bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center gap-3 border-b border-[#F0E6F7] py-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-[#8A05BE] text-sm font-semibold text-white">
                    {initials(loggedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#1D1929]">
                    {loggedUser.name}
                  </p>
                  <p className="truncate text-xs text-[#6B6478]">
                    {loggedUser.email}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <p className="text-xs text-[#6B6478]">
                  CPF {formatCPF(loggedUser.cpf)} · desde{" "}
                  {new Date(loggedUser.createdAt).toLocaleDateString("pt-BR")}
                </p>

                {loggedUser.account ? (
                  <>
                    <div className="mt-4">
                      <p className="text-xs text-[#6B6478]">Saldo disponível</p>
                      <p className="mt-0.5 text-xl font-semibold text-[#1D1929] sm:text-2xl">
                        {formatBRL(loggedUser.account.balance)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-[#F5F2F8] px-3 py-2">
                      <span className="truncate text-xs text-[#8A05BE]">
                        {loggedUser.account.pixKey}
                      </span>
                      <Copy className="h-3.5 w-3.5 shrink-0 text-[#6B6478]" />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-[#F0E6F7] px-2 py-2 sm:px-3">
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#E5383B]" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[#6B6478]">Enviadas</p>
                          <p className="truncate text-sm font-medium text-[#1D1929]">
                            {loggedUser.account.sentTransactions.length}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-[#F0E6F7] px-2 py-2 sm:px-3">
                        <ArrowDownLeft className="h-3.5 w-3.5 shrink-0 text-[#00A868]" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[#6B6478]">
                            Recebidas
                          </p>
                          <p className="truncate text-sm font-medium text-[#1D1929]">
                            {loggedUser.account.receivedTransactions.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {loggedUser.account.card ? (
                      <div className="mt-4 rounded-xl bg-gradient-to-br from-[#8A05BE] to-[#5A027D] p-4">
                        <div className="flex items-center justify-between">
                          <CreditCard className="h-5 w-5 text-white/80" />
                          <Badge
                            variant={
                              loggedUser.account.card.blocked
                                ? "destructive"
                                : "default"
                            }
                            className={
                              loggedUser.account.card.blocked
                                ? "bg-red-500/20 text-red-100 hover:bg-red-500/20"
                                : "bg-white/15 text-white hover:bg-white/15"
                            }
                          >
                            {loggedUser.account.card.blocked
                              ? "Bloqueado"
                              : "Ativo"}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm tracking-widest text-white/90">
                          •••• •••• •••• {loggedUser.account.card.last4}
                        </p>

                        <Separator className="my-3 bg-white/20" />

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-[10px] text-white/70">
                              Limite usado
                            </p>
                            <p className="text-xs text-white">
                              {formatBRL(loggedUser.account.card.usedLimit)} de{" "}
                              {formatBRL(loggedUser.account.card.limit)}
                            </p>
                          </div>
                          <p className="text-[10px] text-white/70">
                            venc.{" "}
                            {new Date(
                              loggedUser.account.card.dueDate,
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        <Progress
                          value={Math.min(
                            100,
                            (loggedUser.account.card.usedLimit /
                              loggedUser.account.card.limit) *
                              100,
                          )}
                          className="mt-2 h-1 bg-white/20"
                        />
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-[#6B6478]">
                        Nenhum cartão associado.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-xs text-[#6B6478]">
                    Nenhuma conta associada.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
