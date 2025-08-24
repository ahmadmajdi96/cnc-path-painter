
-- First, let's see what the current constraint allows and then update it
-- Drop the existing check constraint
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Add a new check constraint that includes all the model types we're using
ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_model_type_check 
CHECK (model_type IN (
  'computer_vision', 
  'object_detection', 
  'object_recognition', 
  'face_recognition', 
  'ocr', 
  'plate_recognition', 
  'nlp', 
  'chatbot', 
  'quality_control'
));
