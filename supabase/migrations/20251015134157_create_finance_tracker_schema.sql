/*
  # Personal Finance Tracker Database Schema

  ## Overview
  This migration creates a complete database schema for a personal finance tracking application
  that helps users manage their expenses, income, and budgets.

  ## New Tables
  
  ### 1. `categories`
  Stores expense and income categories
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References auth.users, owner of the category
  - `name` (text) - Category name (e.g., "Food", "Transport", "Salary")
  - `type` (text) - Either "expense" or "income"
  - `color` (text) - Hex color code for UI visualization
  - `icon` (text) - Icon name for display
  - `created_at` (timestamptz) - Timestamp of creation

  ### 2. `transactions`
  Stores all financial transactions (expenses and income)
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References auth.users, owner of the transaction
  - `category_id` (uuid) - References categories table
  - `amount` (numeric) - Transaction amount
  - `description` (text) - Transaction description
  - `date` (date) - Date of transaction
  - `type` (text) - Either "expense" or "income"
  - `created_at` (timestamptz) - Timestamp of creation

  ### 3. `budgets`
  Stores monthly budget limits for categories
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References auth.users, owner of the budget
  - `category_id` (uuid) - References categories table
  - `amount` (numeric) - Budget limit amount
  - `month` (date) - Month for which budget applies
  - `created_at` (timestamptz) - Timestamp of creation

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforce authentication and ownership checks
  
  ### Policies Created
  For each table (categories, transactions, budgets):
  1. SELECT policy - Users can view only their own records
  2. INSERT policy - Users can create records for themselves
  3. UPDATE policy - Users can update only their own records
  4. DELETE policy - Users can delete only their own records

  ## Indexes
  - Indexes on user_id columns for fast lookups
  - Indexes on date and month columns for time-based queries
  - Index on category_id for join optimization

  ## Important Notes
  1. All user_id fields reference auth.uid() for current authenticated user
  2. Default values ensure data integrity (timestamps, IDs)
  3. Foreign key constraints maintain referential integrity
  4. Cascade deletes ensure cleanup when categories are removed
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  color text NOT NULL DEFAULT '#6366f1',
  icon text NOT NULL DEFAULT 'DollarSign',
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  created_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  month date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id, month)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories table
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for budgets table
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);