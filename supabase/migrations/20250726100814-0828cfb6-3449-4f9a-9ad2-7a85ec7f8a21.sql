-- Add print_params column to printer_3d_configurations table
ALTER TABLE public.printer_3d_configurations 
ADD COLUMN print_params JSONB DEFAULT NULL;