
-- Create chatbots table
CREATE TABLE public.chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  model_type TEXT NOT NULL CHECK (model_type IN ('openai', 'anthropic', 'google', 'custom')),
  model_name TEXT NOT NULL,
  api_key TEXT,
  endpoint_url TEXT,
  connection_type TEXT DEFAULT 'http' CHECK (connection_type IN ('http', 'websocket')),
  system_prompt TEXT,
  temperature NUMERIC DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'training')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot_qa_pairs table
CREATE TABLE public.chatbot_qa_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  confidence_threshold NUMERIC DEFAULT 0.8 CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot_rules table
CREATE TABLE public.chatbot_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('keyword', 'intent', 'sentiment', 'time', 'user_property')),
  condition_value JSONB NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('response', 'redirect', 'escalate', 'collect_info')),
  action_value JSONB NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot_conversations table
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  confidence_score NUMERIC,
  response_time_ms INTEGER,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_qa_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing public access for now)
CREATE POLICY "Allow public access chatbots" ON public.chatbots FOR ALL TO PUBLIC WITH CHECK (true);
CREATE POLICY "Allow public access chatbot_qa_pairs" ON public.chatbot_qa_pairs FOR ALL TO PUBLIC WITH CHECK (true);
CREATE POLICY "Allow public access chatbot_rules" ON public.chatbot_rules FOR ALL TO PUBLIC WITH CHECK (true);
CREATE POLICY "Allow public access chatbot_conversations" ON public.chatbot_conversations FOR ALL TO PUBLIC WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_chatbots_updated_at BEFORE UPDATE ON public.chatbots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_qa_pairs_updated_at BEFORE UPDATE ON public.chatbot_qa_pairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_rules_updated_at BEFORE UPDATE ON public.chatbot_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_chatbot_qa_pairs_chatbot_id ON public.chatbot_qa_pairs(chatbot_id);
CREATE INDEX idx_chatbot_rules_chatbot_id ON public.chatbot_rules(chatbot_id);
CREATE INDEX idx_chatbot_conversations_chatbot_id ON public.chatbot_conversations(chatbot_id);
CREATE INDEX idx_chatbot_conversations_session_id ON public.chatbot_conversations(session_id);
