export type Transaction = {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
  senderId?: string;
  receiverId?: string;
};

export type Card = {
  id: string;
  last4: string;
  limit: number;
  usedLimit: number;
  dueDate: string;
  blocked: boolean;
  accountId: string;
};

export type Account = {
  id: string;
  balance: number;
  pixKey: string;
  userId: string;
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
  card?: Card;
};

export type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  createdAt: string;
  account?: Account;
};
