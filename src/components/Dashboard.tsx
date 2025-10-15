import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Transaction, Category, Budget } from '../lib/supabase';
import { LogOut, Plus, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import CategoryManager from './CategoryManager';
import BudgetManager from './BudgetManager';
import Stats from './Stats';

type View = 'overview' | 'transactions' | 'categories' | 'budgets';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadTransactions(), loadCategories(), loadBudgets()]);
    setLoading(false);
  };

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .order('date', { ascending: false })
      .limit(100);
    if (data) setTransactions(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const loadBudgets = async () => {
    const { data } = await supabase
      .from('budgets')
      .select('*, categories(*)')
      .order('month', { ascending: false });
    if (data) setBudgets(data);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Finance Tracker</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'overview'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setView('transactions')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'transactions'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setView('categories')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'categories'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setView('budgets')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'budgets'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Budgets
            </button>
          </div>

          {(view === 'overview' || view === 'transactions') && (
            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          )}
        </div>

        {view === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm font-medium">Total Balance</span>
                  <Wallet className="w-5 h-5 text-slate-400" />
                </div>
                <div className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${balance.toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm font-medium">Total Income</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  ${totalIncome.toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm font-medium">Total Expenses</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-600">
                  ${totalExpenses.toFixed(2)}
                </div>
              </div>
            </div>

            <Stats transactions={transactions} categories={categories} budgets={budgets} />

            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Transactions</h2>
              <TransactionList
                transactions={transactions.slice(0, 10)}
                onUpdate={loadTransactions}
              />
            </div>
          </>
        )}

        {view === 'transactions' && (
          <TransactionList transactions={transactions} onUpdate={loadTransactions} />
        )}

        {view === 'categories' && (
          <CategoryManager categories={categories} onUpdate={loadCategories} />
        )}

        {view === 'budgets' && (
          <BudgetManager
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            onUpdate={loadBudgets}
          />
        )}
      </div>

      {showTransactionForm && (
        <TransactionForm
          categories={categories}
          onClose={() => setShowTransactionForm(false)}
          onSuccess={() => {
            loadTransactions();
            setShowTransactionForm(false);
          }}
        />
      )}
    </div>
  );
}
