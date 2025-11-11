-- Add missing columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary NUMERIC;

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses (admin only)
DROP POLICY IF EXISTS "Admin can select expenses" ON expenses;
DROP POLICY IF EXISTS "Admin can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Admin can update expenses" ON expenses;
DROP POLICY IF EXISTS "Admin can delete expenses" ON expenses;

CREATE POLICY "Admin can select expenses"
ON expenses FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admin can insert expenses"
ON expenses FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can update expenses"
ON expenses FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admin can delete expenses"
ON expenses FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for expenses updated_at
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();