import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  type?: string;
}

interface MapboxMapProps {
  locations?: Location[];
  onLocationSelect?: (lng: number, lat: number) => void;
  interactive?: boolean;
  height?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  locations = [], 
  onLocationSelect,
  interactive = true,
  height = "h-[500px]"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 2,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (interactive && onLocationSelect) {
      map.current.on('click', (e) => {
        onLocationSelect(e.lngLat.lng, e.lngLat.lat);
      });
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  useEffect(() => {
    if (!map.current || !isTokenSet || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      if (location.latitude && location.longitude) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = 'hsl(var(--primary))';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <h3 style="font-weight: bold; margin-bottom: 4px;">${location.name}</h3>
                  ${location.address ? `<p style="font-size: 12px; color: #666;">${location.address}</p>` : ''}
                  ${location.type ? `<p style="font-size: 11px; color: #999; margin-top: 4px;">${location.type}</p>` : ''}
                </div>
              `)
          )
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });

    // Fit map to markers
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(location => {
        if (location.latitude && location.longitude) {
          bounds.extend([location.longitude, location.latitude]);
        }
      });
      map.current?.fitBounds(bounds, { padding: 50 });
    }
  }, [locations, isTokenSet]);

  if (!isTokenSet) {
    return (
      <div className="space-y-4 p-6 bg-muted/50 rounded-lg border border-border">
        <div>
          <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
          <Input
            id="mapbox-token"
            type="password"
            placeholder="Enter your Mapbox public token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="mt-2"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Get your free Mapbox token at{' '}
          <a 
            href="https://account.mapbox.com/access-tokens/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>
        </p>
        <button
          onClick={() => setIsTokenSet(true)}
          disabled={!mapboxToken}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load Map
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div ref={mapContainer} className={`${height} rounded-lg shadow-lg`} />
      {interactive && (
        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur p-3 rounded-lg shadow-lg text-sm border border-border">
          Click on the map to select a location
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
