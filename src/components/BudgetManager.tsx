import { useState } from 'react';
import { Budget, Category, Transaction, supabase } from '../lib/supabase';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  onUpdate: () => void;
}

export default function BudgetManager({ budgets, categories, transactions, onUpdate }: BudgetManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.from('budgets').insert({
      category_id: categoryId,
      amount: parseFloat(amount),
      month: month + '-01',
    });

    setCategoryId('');
    setAmount('');
    setMonth(new Date().toISOString().slice(0, 7));
    setLoading(false);
    setShowForm(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await supabase.from('budgets').delete().eq('id', id);
      onUpdate();
    }
  };

  const getSpentAmount = (categoryId: string, budgetMonth: string) => {
    const monthStart = new Date(budgetMonth);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    return transactions
      .filter(t =>
        t.category_id === categoryId &&
        t.type === 'expense' &&
        new Date(t.date) >= monthStart &&
        new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Budgets</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Budget</span>
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
          <p className="text-slate-500">No budgets set. Create your first budget to track spending.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const spent = getSpentAmount(budget.category_id, budget.month);
            const percentage = (spent / Number(budget.amount)) * 100;
            const isOverBudget = spent > Number(budget.amount);

            return (
              <div
                key={budget.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">
                      {budget.categories?.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {new Date(budget.month).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-slate-800">
                      ${spent.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500">
                      of ${Number(budget.amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  {isOverBudget && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Over budget by ${(spent - Number(budget.amount)).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="text-sm text-slate-600">
                    {percentage.toFixed(0)}% used
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Add Budget</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="0.00"
                  required
                  min="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
