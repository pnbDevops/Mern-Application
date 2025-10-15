import { useState } from 'react';
import { Category, supabase } from '../lib/supabase';
import { Plus, Trash2, Tag } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: () => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const ICONS = [
  'DollarSign', 'ShoppingCart', 'Home', 'Car', 'Coffee',
  'Heart', 'Book', 'Music', 'Film', 'Gamepad', 'Gift',
  'Briefcase', 'GraduationCap', 'Plane', 'Utensils', 'Smartphone'
];

export default function CategoryManager({ categories, onUpdate }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.from('categories').insert({ name, type, color, icon });

    setName('');
    setType('expense');
    setColor(COLORS[0]);
    setIcon(ICONS[0]);
    setLoading(false);
    setShowForm(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure? This will delete all transactions in this category.')) {
      await supabase.from('categories').delete().eq('id', id);
      onUpdate();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: category.color + '20' }}
              >
                <Tag className="w-6 h-6" style={{ color: category.color }} />
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{category.name}</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                category.type === 'income'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {category.type}
            </span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Add Category</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., Groceries"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      type === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      type === 'income'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-9 gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-lg transition ${
                        color === c ? 'ring-2 ring-slate-400 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
