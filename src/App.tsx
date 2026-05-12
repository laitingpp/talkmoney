import { useState, useEffect, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import ExpenseStats from './components/ExpenseStats';
import RecentExpenses from './components/RecentExpenses';
import { addExpense, getCurrentMonthExpenses } from './utils/storage';
import { Expense } from './types';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    const loadExpenses = () => {
      const data = getCurrentMonthExpenses();
      setExpenses(data);
      setIsLoading(false);
    };
    loadExpenses();
  }, []);

  // 处理语音记账确认
  const handleVoiceConfirm = useCallback((parsedExpense: {
    amount: number;
    description: string;
    category: string;
  }) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parsedExpense.amount,
      category: parsedExpense.category,
      description: parsedExpense.description,
      date: new Date().toISOString(),
      createdAt: Date.now(),
    };

    addExpense(newExpense);
    setExpenses(prev => [newExpense, ...prev]);
  }, []);

  // 刷新数据（删除后调用）
  const handleRefresh = useCallback(() => {
    const data = getCurrentMonthExpenses();
    setExpenses(data);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* 头部 */}
      <header className="pt-12 pb-6 px-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">随口记</h1>
            <p className="text-white/60 text-sm">语音记账助手</p>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="px-6 max-w-md mx-auto">
        {/* 语音输入 */}
        <VoiceInput onConfirm={handleVoiceConfirm} />

        {/* 消费统计 */}
        <ExpenseStats expenses={expenses} />

        {/* 最近记录 */}
        <RecentExpenses expenses={expenses} onDelete={handleRefresh} />
      </main>

      {/* 底部提示 */}
      <footer className="mt-8 text-center">
        <p className="text-white/40 text-xs">
          数据仅存储在本地，保护您的隐私
        </p>
      </footer>
    </div>
  );
}
