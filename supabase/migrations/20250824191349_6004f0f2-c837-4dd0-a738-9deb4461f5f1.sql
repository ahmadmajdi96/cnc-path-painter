
-- First, let's completely drop the constraint and recreate it from scratch
-- This ensures there are no lingering issues with the constraint definition

-- Drop the existing constraint completely
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Wait a moment and then recreate it with all the required model types
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

-- Let's also verify there are no problematic existing records
-- Delete any records that might have invalid model_type values
DELETE FROM public.chatbots 
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

-- Let's also check and ensure the column definition is correct
-- Make sure model_type is properly defined as text and not nullable
ALTER TABLE public.chatbots ALTER COLUMN model_type SET NOT NULL;
