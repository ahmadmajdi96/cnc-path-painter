
-- Let's check the current constraint definition
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'public.chatbots'::regclass 
AND contype = 'c'
AND conname = 'chatbots_model_type_check';

-- Drop the existing constraint completely
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Recreate the constraint with all valid model types including 'ocr'
ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_model_type_check 
CHECK (model_type IN ('chatbot', 'nlp', 'computer_vision', 'face_recognition', 'object_detection', 'object_recognition', 'plate_recognition', 'quality_control', 'ocr'));
