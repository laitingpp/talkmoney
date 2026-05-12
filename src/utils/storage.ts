import { Expense } from '../types';

const STORAGE_KEY = 'suikouji_expenses';

export function getExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.unshift(expense);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getMonthlyExpenses(year: number, month: number): Expense[] {
  const expenses = getExpenses();
  return expenses.filter(e => {
    const date = new Date(e.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

export function getCurrentMonthExpenses(): Expense[] {
  const now = new Date();
  return getMonthlyExpenses(now.getFullYear(), now.getMonth());
}
