import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Expense } from '../types';
import { getCategoryById } from '../data/categories';
import { deleteExpense } from '../utils/storage';

interface RecentExpensesProps {
  expenses: Expense[];
  onDelete: () => void;
}

export default function RecentExpenses({ expenses, onDelete }: RecentExpensesProps) {
  const [expanded, setExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteExpense(id);
      onDelete();
      setDeletingId(null);
    }, 200);
  };

  const displayExpenses = expanded ? expenses : expenses.slice(0, 5);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-semibold">最近记录</h2>
        <span className="text-white/60 text-sm">{expenses.length} 笔</span>
      </div>

      <div className="space-y-2">
        {displayExpenses.map((expense) => {
          const cat = getCategoryById(expense.category);
          const isDeleting = deletingId === expense.id;

          return (
            <div
              key={expense.id}
              className={`
                flex items-center justify-between bg-white/5 rounded-xl p-3
                transition-all duration-200
                ${isDeleting ? 'opacity-0 transform -translate-x-full' : 'opacity-100'}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${cat?.color}20` }}
                >
                  <span
                    className="text-lg"
                    style={{ color: cat?.color }}
                  >
                    {cat?.name?.[0] || '其'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {expense.description.length > 10
                      ? expense.description.slice(0, 10) + '...'
                      : expense.description}
                  </p>
                  <p className="text-white/50 text-xs">
                    {new Date(expense.date).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white font-medium">
                  -¥{expense.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {expenses.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 py-3 text-white/60 text-sm flex items-center justify-center gap-1 hover:text-white transition-colors"
        >
          {expanded ? (
            <>
              收起 <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              查看更多 ({expenses.length - 5}) <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
