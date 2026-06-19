"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { CreditCard, ArrowUpRight, ArrowDownLeft, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
  senderId?: string;
  receiverId?: string;
};

type Card = {
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
  card?: Card;
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
  const router = useRouter();
  const [receiverPixKey, setReceiverPixKey] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const loadUsers = async () => {
    const { data } = await api.get<User[]>("/auth/users");
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get<User[]>("/auth/users");
      setUsers(data);
      setLoading(false);
    };

    load();

    loadUsers();

    const onFocus = () => loadUsers();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function sendPix() {
    try {
      await api.post("/auth/pix", {
        receiverPixKey,
        amount,
      });

      alert("Pix enviado com sucesso!");

      await loadUsers(); //
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || "Erro ao enviar Pix");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0014]">
        <div className="flex items-center gap-3 text-sm text-[#A78BCB]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#A78BCB] border-t-transparent" />
          Carregando contas...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0014] px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8B5CF6]">
              Painel administrativo
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Contas cadastradas
            </h1>

            <Button
              onClick={() => router.push("/")}
              className="mt-4 cursor-pointer flex items-center gap-2 rounded-lg bg-[#1E0F33] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8B5CF6]/10"
            >
              <span className="text-sm text-[#A78BCB]">Criar nova conta</span>
            </Button>
          </div>
          <div className="rounded-full border border-[#2A1B3D] bg-[#150A22] px-4 py-1.5 text-sm text-[#A78BCB]">
            {users.length} {users.length === 1 ? "conta" : "contas"}
          </div>
          <div className="mt-6 flex gap-2">
            <input
              placeholder="Chave Pix"
              value={receiverPixKey}
              onChange={(e) => setReceiverPixKey(e.target.value)}
              className="rounded-lg bg-[#0B0014] px-3 py-2 text-white border border-[#2A1B3D]"
            />

            <input
              placeholder="Valor"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="rounded-lg bg-[#0B0014] px-3 py-2 text-white border border-[#2A1B3D]"
            />

            <button
              onClick={sendPix}
              className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-white"
            >
              Enviar Pix
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="overflow-hidden rounded-2xl border border-[#2A1B3D] bg-[#150A22] transition-colors hover:border-[#8B5CF6]/40"
            >
              <div className="flex items-center gap-3 border-b border-[#2A1B3D] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-sm font-semibold text-white">
                  {initials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{user.name}</p>
                  <p className="truncate text-xs text-[#8B7C9C]">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs text-[#8B7C9C]">
                  CPF {formatCPF(user.cpf)} · desde{" "}
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </p>

                {user.account ? (
                  <>
                    <div className="mt-4">
                      <p className="text-xs text-[#8B7C9C]">Saldo disponível</p>
                      <p className="mt-0.5 text-2xl font-semibold text-white">
                        {formatBRL(user.account.balance)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg bg-[#0B0014] px-3 py-2">
                      <span className="truncate text-xs text-[#A78BCB]">
                        {user.account.pixKey}
                      </span>
                      <Copy className="h-3.5 w-3.5 shrink-0 text-[#8B7C9C]" />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-[#2A1B3D] px-3 py-2">
                        <ArrowUpRight className="h-3.5 w-3.5 text-[#F87171]" />
                        <div>
                          <p className="text-[10px] text-[#8B7C9C]">Enviadas</p>
                          <p className="text-sm font-medium text-white">
                            {user.account.sentTransactions.length}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-[#2A1B3D] px-3 py-2">
                        <ArrowDownLeft className="h-3.5 w-3.5 text-[#4ADE80]" />
                        <div>
                          <p className="text-[10px] text-[#8B7C9C]">
                            Recebidas
                          </p>
                          <p className="text-sm font-medium text-white">
                            {user.account.receivedTransactions.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {user.account.card ? (
                      <div className="mt-4 rounded-xl bg-gradient-to-br from-[#1E0F33] to-[#120819] p-4">
                        <div className="flex items-center justify-between">
                          <CreditCard className="h-5 w-5 text-[#A78BCB]" />
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              user.account.card.blocked
                                ? "bg-red-500/15 text-red-400"
                                : "bg-emerald-500/15 text-emerald-400"
                            }`}
                          >
                            {user.account.card.blocked ? "Bloqueado" : "Ativo"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm tracking-widest text-[#D6CBE8]">
                          •••• •••• •••• {user.account.card.last4}
                        </p>
                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-[#8B7C9C]">
                              Limite usado
                            </p>
                            <p className="text-xs text-white">
                              {formatBRL(user.account.card.usedLimit)} de{" "}
                              {formatBRL(user.account.card.limit)}
                            </p>
                          </div>
                          <p className="text-[10px] text-[#8B7C9C]">
                            venc.{" "}
                            {new Date(
                              user.account.card.dueDate,
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#2A1B3D]">
                          <div
                            className="h-full rounded-full bg-[#8B5CF6]"
                            style={{
                              width: `${Math.min(
                                100,
                                (user.account.card.usedLimit /
                                  user.account.card.limit) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-[#8B7C9C]">
                        Nenhum cartão associado.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-xs text-[#8B7C9C]">
                    Nenhuma conta associada.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
