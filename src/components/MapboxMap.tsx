import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  route?: any;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  locations = [], 
  onLocationSelect,
  interactive = true,
  height = "h-[500px]",
  route
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYS1zYWxhbWVoMTIzIiwiYSI6ImNtZWI3ZGRudTB6c2QycXF1anZ3NGllYnYifQ.gS3wGBHSqtmSXQT7TWjgnQ';
    
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
  }, []);

  useEffect(() => {
    if (!map.current || locations.length === 0) return;

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
  }, [locations]);

  // Update route when it changes
  useEffect(() => {
    if (!map.current || !route) return;

    const addRouteToMap = () => {
      if (!map.current) return;

      // Remove existing route layer if it exists
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }

      // Add route source and layer
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.routes[0].geometry
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    };

    if (map.current.isStyleLoaded()) {
      addRouteToMap();
    } else {
      map.current.on('load', addRouteToMap);
    }
  }, [route]);

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
