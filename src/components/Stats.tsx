import { Transaction, Category, Budget } from '../lib/supabase';
import { PieChart, TrendingUp } from 'lucide-react';

interface StatsProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

export default function Stats({ transactions, categories }: StatsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthStart = new Date(currentMonth + '-01');
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= monthStart && tDate <= monthEnd;
  });

  const expensesByCategory = categories
    .filter(c => c.type === 'expense')
    .map(category => {
      const total = monthTransactions
        .filter(t => t.category_id === category.id && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { category, total };
    })
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const totalMonthExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const last30Days = transactions.filter(t => {
    const tDate = new Date(t.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return tDate >= thirtyDaysAgo;
  });

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTransactions = last30Days.filter(t =>
      new Date(t.date).toDateString() === date.toDateString()
    );
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      expenses,
      income,
    };
  });

  const maxAmount = Math.max(
    ...dailyData.map(d => Math.max(d.expenses, d.income)),
    100
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-2 mb-6">
          <PieChart className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">
            Top Expenses This Month
          </h3>
        </div>

        {expensesByCategory.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No expenses this month</p>
        ) : (
          <div className="space-y-4">
            {expensesByCategory.map(({ category, total }) => {
              const percentage = (total / totalMonthExpenses) * 100;
              return (
                <div key={category.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {category.name}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {percentage.toFixed(1)}% of total expenses
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">
            Last 7 Days Activity
          </h3>
        </div>

        <div className="space-y-4">
          {dailyData.map((day, index) => (
            <div key={index}>
              <div className="text-sm font-medium text-slate-700 mb-2">
                {day.date}
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">Expenses</span>
                    <span className="text-xs font-medium text-red-600">
                      ${day.expenses.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${(day.expenses / maxAmount) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">Income</span>
                    <span className="text-xs font-medium text-emerald-600">
                      ${day.income.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(day.income / maxAmount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
