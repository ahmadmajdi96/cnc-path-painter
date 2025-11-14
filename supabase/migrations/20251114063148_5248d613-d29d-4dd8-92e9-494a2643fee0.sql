-- Update chatbots table check constraint to include missing model types
ALTER TABLE chatbots DROP CONSTRAINT IF EXISTS chatbots_model_type_check;

ALTER TABLE chatbots ADD CONSTRAINT chatbots_model_type_check 
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
  'path_optimization',
  'cost_reduction',
  'business_analyzer',
  'decision_maker',
  'business'
));