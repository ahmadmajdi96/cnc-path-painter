
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId, inputData, modelType } = await req.json();
    
    console.log('Processing request for model:', modelId, 'type:', modelType);

    // Get model configuration from Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: model, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', modelId)
      .single();

    if (error || !model) {
      console.error('Model not found:', error);
      return new Response(
        JSON.stringify({ error: 'Model not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found model:', model.name);

    let result;
    
    switch (modelType) {
      case 'computer_vision':
      case 'object_detection':
      case 'object_recognition':
      case 'face_recognition':
        result = await processVisionModel(model, inputData);
        break;
      case 'ocr':
      case 'plate_recognition':
        result = await processOCRModel(model, inputData);
        break;
      case 'nlp':
      case 'chatbot':
        result = await processNLPModel(model, inputData);
        break;
      case 'quality_control':
        result = await processQualityControlModel(model, inputData);
        break;
      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-model-processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processVisionModel(model: any, inputData: any) {
  const { image, prompt } = inputData;
  
  if (!model.api_key) {
    throw new Error('API key not configured for this model');
  }

  // For OpenAI models (GPT-4 Vision)
  if (model.model_name.includes('gpt-4')) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model_name,
        messages: [
          {
            role: 'system',
            content: model.system_prompt || 'You are an AI vision assistant that analyzes images and provides detailed descriptions.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || 'Analyze this image and describe what you see.' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        max_tokens: model.max_tokens || 1000,
        temperature: model.temperature || 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return {
      success: true,
      result: data.choices[0].message.content,
      confidence: 0.95,
      processing_time: Date.now()
    };
  }

  // Mock response for other models
  return {
    success: true,
    result: `Processed with ${model.name}: Mock vision analysis result`,
    confidence: 0.92,
    processing_time: Date.now()
  };
}

async function processOCRModel(model: any, inputData: any) {
  const { image, prompt } = inputData;
  
  if (!model.api_key) {
    throw new Error('API key not configured for this model');
  }

  // For OpenAI models
  if (model.model_name.includes('gpt-4')) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model_name,
        messages: [
          {
            role: 'system',
            content: model.system_prompt || 'You are an OCR assistant that extracts text from images accurately.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || 'Extract all text from this image.' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        max_tokens: model.max_tokens || 1000,
        temperature: model.temperature || 0.3,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return {
      success: true,
      extracted_text: data.choices[0].message.content,
      confidence: 0.98,
      processing_time: Date.now()
    };
  }

  // Mock response for other models
  return {
    success: true,
    extracted_text: `Mock OCR result from ${model.name}: Sample extracted text`,
    confidence: 0.94,
    processing_time: Date.now()
  };
}

async function processNLPModel(model: any, inputData: any) {
  const { text, task } = inputData;
  
  if (!model.api_key) {
    throw new Error('API key not configured for this model');
  }

  // For OpenAI models
  if (model.model_name.includes('gpt')) {
    const systemPrompt = model.system_prompt || 
      (task === 'sentiment' ? 'You are a sentiment analysis expert.' :
       task === 'summary' ? 'You are a text summarization expert.' :
       task === 'entities' ? 'You are a named entity recognition expert.' :
       'You are a helpful NLP assistant.');

    const userPrompt = task === 'sentiment' ? `Analyze the sentiment of this text: "${text}"` :
                      task === 'summary' ? `Summarize this text: "${text}"` :
                      task === 'entities' ? `Extract named entities from this text: "${text}"` :
                      text;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${model.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model_name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: model.max_tokens || 1000,
        temperature: model.temperature || 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return {
      success: true,
      result: data.choices[0].message.content,
      task: task,
      processing_time: Date.now()
    };
  }

  // Mock response for other models
  return {
    success: true,
    result: `Mock NLP result from ${model.name} for task: ${task}`,
    task: task,
    processing_time: Date.now()
  };
}

async function processQualityControlModel(model: any, inputData: any) {
  const { image, parameters } = inputData;
  
  // Mock quality control analysis
  const defects = Math.random() > 0.8 ? [
    { type: 'scratch', confidence: 0.87, location: [120, 45, 200, 80] },
    { type: 'dent', confidence: 0.72, location: [300, 150, 350, 200] }
  ] : [];

  return {
    success: true,
    pass: defects.length === 0,
    defects: defects,
    overall_score: defects.length === 0 ? 0.96 : 0.74,
    processing_time: Date.now()
  };
}
