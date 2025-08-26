
-- Check the current check constraint on chatbots table
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.chatbots'::regclass 
AND contype = 'c';

-- Get the table definition to see the constraint
\d+ public.chatbots;
