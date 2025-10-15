import { Transaction } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

export default function TransactionList({ transactions, onUpdate }: TransactionListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await supabase.from('transactions').delete().eq('id', id);
      onUpdate();
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
        <p className="text-slate-500">No transactions yet. Add your first transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: transaction.categories?.color + '20',
                      color: transaction.categories?.color,
                    }}
                  >
                    {transaction.categories?.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                    {transaction.type === 'income' ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 font-medium">Income</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 font-medium">Expense</span>
                      </>
                    )}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
