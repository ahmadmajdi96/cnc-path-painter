import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buildId, websiteData } = await req.json();
    
    const NOVITA_API_KEY = Deno.env.get('NOVITA_AI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!NOVITA_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Start background task to process the website build
    EdgeRuntime.waitUntil((async () => {
      try {
        console.log('Starting website build for:', buildId);
        
        // Call Novita AI API with just the JSON object
        const response = await fetch('https://api.novita.ai/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NOVITA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'kat-coder',
            messages: [
              { role: 'user', content: JSON.stringify(websiteData, null, 2) }
            ],
            max_tokens: 8000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Novita AI API error:', response.status, errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const aiResponse = await response.json();
        const generatedCode = aiResponse.choices[0].message.content;

        // Save the result as a JSON file in the database
        const resultData = {
          website_type: websiteData.website_type,
          generated_at: new Date().toISOString(),
          code: generatedCode,
          specifications: websiteData,
        };

        // Update the build record with completed status
        const { error: updateError } = await supabase
          .from('website_builds')
          .update({
            status: 'completed',
            result_file_url: `data:application/json;base64,${btoa(JSON.stringify(resultData, null, 2))}`,
            completed_at: new Date().toISOString(),
          })
          .eq('id', buildId);

        if (updateError) {
          console.error('Error updating build status:', updateError);
          throw updateError;
        }

        console.log('Website build completed successfully for:', buildId);
      } catch (error) {
        console.error('Error in background task:', error);
        
        // Update the build record with error status
        await supabase
          .from('website_builds')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', buildId);
      }
    })());

    // Return immediate response
    return new Response(
      JSON.stringify({ success: true, buildId, message: 'Website build started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in build-website function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});