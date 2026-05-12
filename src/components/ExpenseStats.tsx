import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryById } from '../data/categories';
import { Expense } from '../types';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export default function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryMap = new Map<string, number>();
    expenses.forEach(e => {
      const current = categoryMap.get(e.category) || 0;
      categoryMap.set(e.category, current + e.amount);
    });

    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { total, categoryStats };
  }, [expenses]);

  const chartData = useMemo(() => {
    return stats.categoryStats.map(item => {
      const cat = getCategoryById(item.category);
      return {
        name: cat?.name || '其他',
        value: item.amount,
        color: cat?.color || '#6b7280',
      };
    });
  }, [stats.categoryStats]);

  if (expenses.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6">
        <h2 className="text-white text-lg font-semibold mb-4">本月消费</h2>
        <div className="text-center py-8">
          <p className="text-white/60 text-sm">还没有记录哦</p>
          <p className="text-white/40 text-xs mt-1">点击上方麦克风开始记账</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6">
      <h2 className="text-white text-lg font-semibold mb-4">本月消费</h2>
      
      {/* 总支出 */}
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm mb-1">总支出</p>
        <p className="text-4xl font-bold text-white">
          ¥{stats.total.toFixed(2)}
        </p>
        <p className="text-white/60 text-xs mt-1">
          共 {expenses.length} 笔记录
        </p>
      </div>

      {/* 饼图 */}
      {chartData.length > 0 && (
        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `¥${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 分类列表 */}
      <div className="space-y-3">
        {stats.categoryStats.map((item) => {
          const cat = getCategoryById(item.category);
          return (
            <div
              key={item.category}
              className="flex items-center justify-between bg-white/5 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat?.color || '#6b7280' }}
                />
                <span className="text-white text-sm">{cat?.name || '其他'}</span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">
                  ¥{item.amount.toFixed(2)}
                </p>
                <p className="text-white/50 text-xs">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
