
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProcessingResult {
  success: boolean;
  result?: any;
  extracted_text?: string;
  defects?: any[];
  pass?: boolean;
  overall_score?: number;
  confidence?: number;
  processing_time?: number;
  task?: string;
  error?: string;
}

export const useAIModelProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();

  const processWithModel = async (
    modelId: string,
    modelType: string,
    inputData: any
  ): Promise<ProcessingResult> => {
    if (!modelId) {
      const error = 'Please select an AI model first';
      toast({
        title: "No model selected",
        description: error,
        variant: "destructive"
      });
      throw new Error(error);
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-model-processor', {
        body: {
          modelId,
          modelType,
          inputData
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Processing failed');
      }

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      toast({
        title: "Processing complete",
        description: "AI model has successfully processed your request"
      });

      return data;
    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      
      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processWithModel,
    isProcessing,
    result,
    setResult
  };
};
