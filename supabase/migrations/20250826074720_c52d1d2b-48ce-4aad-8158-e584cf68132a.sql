
-- First, let's see the current constraint
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'public.chatbots'::regclass 
AND contype = 'c';

-- Drop the existing check constraint and create a new one that includes 'ocr'
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Add the updated constraint that includes 'ocr' as a valid model type
ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_model_type_check 
CHECK (model_type = ANY (ARRAY['chatbot'::text, 'nlp'::text, 'computer_vision'::text, 'face_recognition'::text, 'object_detection'::text, 'object_recognition'::text, 'plate_recognition'::text, 'quality_control'::text, 'ocr'::text]));
