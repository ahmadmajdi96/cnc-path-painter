-- Drop the existing check constraint
ALTER TABLE public.chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

-- Add a new check constraint with all supported model types
ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_model_type_check 
CHECK (model_type IN (
  'chatbot',
  'nlp',
  'computer_vision',
  'face_recognition',
  'object_detection',
  'object_recognition',
  'plate_recognition',
  'quality_control',
  'ocr',
  'vehicle_detection',
  'vehicle_recognition',
  'human_detection',
  'plate_detection',
  'plate_number_extraction',
  'speech_recognition',
  'speech_synthesis',
  'speaker_identification',
  'path_optimization'
));