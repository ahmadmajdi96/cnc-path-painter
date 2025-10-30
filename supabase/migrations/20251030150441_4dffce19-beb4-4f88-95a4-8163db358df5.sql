-- Create table for storing locations
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  type TEXT NOT NULL CHECK (type IN ('start', 'stop', 'end')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing trips
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  end_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for trip stops (for single route with multiple stops)
CREATE TABLE public.trip_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for optimized routes
CREATE TABLE public.optimized_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  route_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_distance NUMERIC,
  total_duration NUMERIC,
  optimization_algorithm TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimized_routes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert locations" ON public.locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update locations" ON public.locations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete locations" ON public.locations FOR DELETE USING (true);

CREATE POLICY "Allow public read access trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Allow public insert trips" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update trips" ON public.trips FOR UPDATE USING (true);
CREATE POLICY "Allow public delete trips" ON public.trips FOR DELETE USING (true);

CREATE POLICY "Allow public read access trip_stops" ON public.trip_stops FOR SELECT USING (true);
CREATE POLICY "Allow public insert trip_stops" ON public.trip_stops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update trip_stops" ON public.trip_stops FOR UPDATE USING (true);
CREATE POLICY "Allow public delete trip_stops" ON public.trip_stops FOR DELETE USING (true);

CREATE POLICY "Allow public read access optimized_routes" ON public.optimized_routes FOR SELECT USING (true);
CREATE POLICY "Allow public insert optimized_routes" ON public.optimized_routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update optimized_routes" ON public.optimized_routes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete optimized_routes" ON public.optimized_routes FOR DELETE USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();