-- Delete the problematic test row
DELETE FROM chatbots WHERE name = 'testing';

-- Drop the existing constraint completely
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Recreate the constraint with the correct model types including 'ocr'
ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_model_type_check 
CHECK (model_type IN ('chatbot', 'nlp', 'computer_vision', 'face_recognition', 'object_detection', 'object_recognition', 'plate_recognition', 'quality_control', 'ocr'));