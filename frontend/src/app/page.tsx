"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/users");
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar users:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const data = { name: "John Doe" }; // Mocked data for demonstration

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 bg-white rounded shadow mb-4 w-full max-w-md"
        >
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      ))}
    </div>
  );
}
