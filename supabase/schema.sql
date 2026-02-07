-- ============================================
-- FINTRACK DATABASE SCHEMA
-- Sistema de Presupuesto con Soporte Multi-Moneda
-- ============================================

-- ============================================
-- 1. TABLA: profiles
-- Extiende auth.users con información adicional del usuario
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency_preference TEXT DEFAULT 'USD' CHECK (currency_preference IN ('USD', 'COP')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABLA: categories
-- Categorías de ingresos y gastos
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABLA: accounts
-- Cuentas bancarias, tarjetas, efectivo
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card', 'savings')),
  balance_usd DECIMAL(12, 2) DEFAULT 0,
  balance_cop DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TABLA: budgets
-- Presupuestos con soporte multi-moneda
-- Cada presupuesto puede tener monto en USD y COP
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount_usd DECIMAL(12, 2) DEFAULT 0,
  amount_cop DECIMAL(12, 2) DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABLA: transactions
-- Transacciones con moneda específica y asociación a presupuesto
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'COP')),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ÍNDICES para mejorar rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- Asegura que los usuarios solo vean sus propios datos
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para categories
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para accounts
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 8. VISTA: budget_progress
-- Calcula el progreso de presupuestos por moneda
-- ============================================
CREATE OR REPLACE VIEW budget_progress AS
SELECT 
  b.id AS budget_id,
  b.user_id,
  b.category_id,
  b.name,
  b.amount_usd,
  b.amount_cop,
  b.period,
  b.start_date,
  b.end_date,
  -- Calcular gastos en USD
  COALESCE(SUM(CASE WHEN t.currency = 'USD' AND t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_usd,
  -- Calcular gastos en COP
  COALESCE(SUM(CASE WHEN t.currency = 'COP' AND t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_cop,
  -- Calcular porcentaje de uso USD
  CASE 
    WHEN b.amount_usd > 0 THEN (COALESCE(SUM(CASE WHEN t.currency = 'USD' AND t.type = 'expense' THEN t.amount ELSE 0 END), 0) / b.amount_usd * 100)
    ELSE 0 
  END AS percentage_usd,
  -- Calcular porcentaje de uso COP
  CASE 
    WHEN b.amount_cop > 0 THEN (COALESCE(SUM(CASE WHEN t.currency = 'COP' AND t.type = 'expense' THEN t.amount ELSE 0 END), 0) / b.amount_cop * 100)
    ELSE 0 
  END AS percentage_cop
FROM budgets b
LEFT JOIN transactions t ON t.budget_id = b.id 
  AND t.date >= b.start_date 
  AND (b.end_date IS NULL OR t.date <= b.end_date)
GROUP BY b.id, b.user_id, b.category_id, b.name, b.amount_usd, b.amount_cop, b.period, b.start_date, b.end_date;

-- ============================================
-- 9. FUNCIÓN: create_default_categories
-- Crea categorías predeterminadas para nuevos usuarios
-- ============================================
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
    (user_uuid, 'Alimentación', 'expense', 'UtensilsCrossed', 'hsl(158, 64%, 42%)', true),
    (user_uuid, 'Transporte', 'expense', 'Car', 'hsl(199, 89%, 48%)', true),
    (user_uuid, 'Servicios', 'expense', 'Zap', 'hsl(43, 96%, 56%)', true),
    (user_uuid, 'Entretenimiento', 'expense', 'Gamepad2', 'hsl(0, 72%, 51%)', true),
    (user_uuid, 'Salud', 'expense', 'Heart', 'hsl(262, 52%, 56%)', true),
    (user_uuid, 'Educación', 'expense', 'GraduationCap', 'hsl(280, 65%, 60%)', true),
    (user_uuid, 'Vivienda', 'expense', 'Home', 'hsl(25, 95%, 53%)', true),
    (user_uuid, 'Salario', 'income', 'Building2', 'hsl(158, 64%, 42%)', true),
    (user_uuid, 'Otros Ingresos', 'income', 'TrendingUp', 'hsl(199, 89%, 48%)', true);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. FUNCIÓN: handle_new_user
-- Trigger que se ejecuta al crear un nuevo usuario
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear perfil del usuario
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Crear categorías predeterminadas
  PERFORM create_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. TRIGGER: on_auth_user_created
-- Se ejecuta automáticamente al registrar un usuario
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 12. FUNCIÓN: update_updated_at_column
-- Actualiza automáticamente el campo updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
