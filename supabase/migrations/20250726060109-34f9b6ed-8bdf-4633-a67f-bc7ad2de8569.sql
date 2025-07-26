-- Add unique constraint on printer_id to make upsert work correctly
ALTER TABLE public.printer_3d_configurations 
ADD CONSTRAINT printer_3d_configurations_printer_id_unique UNIQUE (printer_id);