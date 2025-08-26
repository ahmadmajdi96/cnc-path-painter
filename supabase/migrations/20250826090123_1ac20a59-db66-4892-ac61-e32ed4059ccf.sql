-- Update existing rows to conform to new constraint
UPDATE chatbots SET model_type = 'nlp' WHERE model_type = 'openai';
UPDATE chatbots SET model_type = 'nlp' WHERE model_type = 'anthropic';
UPDATE chatbots SET model_type = 'nlp' WHERE model_type = 'google';
UPDATE chatbots SET model_type = 'nlp' WHERE model_type = 'custom';

-- Drop the existing constraint completely
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Recreate the constraint with the correct model types including 'ocr'
ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_model_type_check 
CHECK (model_type IN ('chatbot', 'nlp', 'computer_vision', 'face_recognition', 'object_detection', 'object_recognition', 'plate_recognition', 'quality_control', 'ocr'));