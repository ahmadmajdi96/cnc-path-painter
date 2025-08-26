
-- Check current RLS policies on chatbots table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'chatbots';

-- Drop the existing restrictive policy and create a proper one
DROP POLICY IF EXISTS "Allow public access chatbots" ON public.chatbots;

-- Create a more permissive policy that allows all operations
CREATE POLICY "Allow all operations on chatbots" 
ON public.chatbots 
FOR ALL 
USING (true) 
WITH CHECK (true);
