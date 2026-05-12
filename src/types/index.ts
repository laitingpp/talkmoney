export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface MonthlyStats {
  total: number;
  categoryStats: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}
