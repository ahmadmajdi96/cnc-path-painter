-- Insert default AI models for all AI capabilities
INSERT INTO public.chatbots (name, description, model_type, model_name, status, system_prompt, temperature, max_tokens) VALUES
-- Computer Vision Models
('GPT-4 Vision', 'Advanced computer vision analysis using GPT-4V', 'computer_vision', 'gpt-4-vision-preview', 'active', 'You are an expert computer vision AI that analyzes images with high accuracy. Provide detailed descriptions of objects, scenes, and activities.', 0.7, 1000),
('Object Detection Pro', 'High-precision object detection and localization', 'object_detection', 'gpt-4-vision-preview', 'active', 'You are specialized in detecting and localizing objects in images. Provide bounding box coordinates and confidence scores.', 0.5, 800),
('Face Recognition AI', 'Advanced facial recognition and analysis', 'face_recognition', 'gpt-4-vision-preview', 'active', 'You are a facial recognition expert. Analyze faces for identification, emotion, age, and other attributes while respecting privacy.', 0.6, 800),

-- OCR Models
('OCR Standard', 'Optical character recognition for text extraction', 'ocr', 'gpt-4-vision-preview', 'active', 'You are an OCR specialist. Extract all visible text from images with high accuracy, maintaining formatting where possible.', 0.3, 1000),
('License Plate Reader', 'Specialized license plate detection and extraction', 'plate_recognition', 'gpt-4-vision-preview', 'active', 'You specialize in detecting and reading license plates. Extract plate numbers, verify format, and provide location data.', 0.2, 500),

-- NLP Models
('NLP Assistant', 'Natural language processing and text analysis', 'nlp', 'gpt-4-turbo-preview', 'active', 'You are an NLP expert capable of sentiment analysis, entity extraction, summarization, and text classification.', 0.7, 1500),
('Sentiment Analyzer', 'Advanced sentiment and emotion analysis', 'nlp', 'gpt-4-turbo-preview', 'active', 'You specialize in analyzing sentiment and emotions in text. Provide detailed sentiment scores and emotional context.', 0.5, 800),

-- Chatbot Models
('Customer Support Bot', 'Intelligent customer service chatbot', 'chatbot', 'gpt-4-turbo-preview', 'active', 'You are a helpful customer support assistant. Be polite, professional, and solve customer issues efficiently.', 0.8, 2000),
('Technical Assistant', 'Technical support and troubleshooting chatbot', 'chatbot', 'gpt-4-turbo-preview', 'active', 'You are a technical support specialist. Help users with technical issues, provide step-by-step solutions, and explain complex concepts clearly.', 0.7, 1500),

-- Quality Control
('Quality Inspector', 'Automated quality control and defect detection', 'quality_control', 'gpt-4-vision-preview', 'active', 'You are a quality control inspector. Analyze products for defects, inconsistencies, and quality issues. Provide pass/fail assessments.', 0.4, 1000),

-- Vehicle Systems
('Vehicle Detector', 'Vehicle detection and classification', 'object_detection', 'gpt-4-vision-preview', 'active', 'You specialize in detecting and classifying vehicles. Identify vehicle types, makes, models, and provide precise locations.', 0.5, 800),
('Human Detector', 'Human presence and activity detection', 'object_detection', 'gpt-4-vision-preview', 'active', 'You detect and track human presence in images. Analyze poses, activities, and count people accurately.', 0.5, 800)
ON CONFLICT DO NOTHING;

-- Insert sample rules for chatbots
WITH chatbot_ids AS (
  SELECT id, name FROM public.chatbots WHERE model_type = 'chatbot'
)
INSERT INTO public.chatbot_rules (chatbot_id, name, description, condition_type, condition_value, action_type, action_value, priority, is_active) 
SELECT 
  id,
  'Greeting Rule',
  'Respond to greetings with a friendly welcome',
  'keyword',
  '{"keywords": ["hello", "hi", "hey", "greetings"]}'::jsonb,
  'response',
  '{"message": "Hello! How can I assist you today?"}'::jsonb,
  1,
  true
FROM chatbot_ids
UNION ALL
SELECT 
  id,
  'Escalation Rule',
  'Escalate urgent or complex issues',
  'keyword',
  '{"keywords": ["urgent", "emergency", "manager", "escalate"]}'::jsonb,
  'escalate',
  '{"action": "notify_manager", "priority": "high"}'::jsonb,
  2,
  true
FROM chatbot_ids
UNION ALL
SELECT 
  id,
  'Business Hours Check',
  'Inform about business hours when asked',
  'keyword',
  '{"keywords": ["hours", "open", "closed", "schedule"]}'::jsonb,
  'response',
  '{"message": "Our business hours are Monday-Friday, 9 AM to 6 PM EST."}'::jsonb,
  1,
  true
FROM chatbot_ids
ON CONFLICT DO NOTHING;