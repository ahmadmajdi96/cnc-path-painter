-- Create rules_datasets table
CREATE TABLE public.rules_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rules table
CREATE TABLE public.rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.rules_datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT,
  is_expanded BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_rules table
CREATE TABLE public.sub_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.rules(id) ON DELETE CASCADE,
  prompt TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_datasets table
CREATE TABLE public.question_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.question_datasets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_expanded BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_questions table
CREATE TABLE public.sub_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rules_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for rules_datasets
CREATE POLICY "Allow public read access rules_datasets"
ON public.rules_datasets FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert/update rules_datasets"
ON public.rules_datasets FOR ALL
USING (true);

-- Create policies for rules
CREATE POLICY "Allow public read access rules"
ON public.rules FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert/update rules"
ON public.rules FOR ALL
USING (true);

-- Create policies for sub_rules
CREATE POLICY "Allow public read access sub_rules"
ON public.sub_rules FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert/update sub_rules"
ON public.sub_rules FOR ALL
USING (true);

-- Create policies for question_datasets
CREATE POLICY "Allow public read access question_datasets"
ON public.question_datasets FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert/update question_datasets"
ON public.question_datasets FOR ALL
USING (true);

-- Create policies for questions
CREATE POLICY "Allow public read access questions"
ON public.questions FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert/update questions"
ON public.questions FOR ALL
USING (true);

-- Create policies for sub_questions
CREATE POLICY "Allow public read access sub_questions"
ON public.sub_questions FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert/update sub_questions"
ON public.sub_questions FOR ALL
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_rules_datasets_updated_at
BEFORE UPDATE ON public.rules_datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rules_updated_at
BEFORE UPDATE ON public.rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_datasets_updated_at
BEFORE UPDATE ON public.question_datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();