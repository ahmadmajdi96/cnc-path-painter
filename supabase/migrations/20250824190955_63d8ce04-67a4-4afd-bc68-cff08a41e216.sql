
-- Let's check the current constraint and make sure it's properly updated
-- First, drop any existing constraint completely
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Now add the correct constraint with all needed model types
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

-- Also let's check if there are any existing records that might be causing issues
-- Update any existing records with invalid model_type values
UPDATE public.chatbots 
SET model_type = 'chatbot' 
WHERE model_type NOT IN (
  'computer_vision', 
  'object_detection', 
  'object_recognition', 
  'face_recognition', 
  'ocr', 
  'plate_recognition', 
  'nlp', 
  'chatbot', 
  'quality_control'
);
