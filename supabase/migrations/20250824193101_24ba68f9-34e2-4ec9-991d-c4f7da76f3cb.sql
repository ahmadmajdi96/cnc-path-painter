
-- First, let's see what the current check constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'chatbots'::regclass 
AND contype = 'c';

-- Update the check constraint to allow 'ocr' as a valid model type
ALTER TABLE chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

ALTER TABLE chatbots ADD CONSTRAINT chatbots_model_type_check 
CHECK (model_type IN ('chatbot', 'nlp', 'computer_vision', 'face_recognition', 'object_detection', 'object_recognition', 'plate_recognition', 'quality_control', 'ocr'));
