
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2 } from 'lucide-react';

interface SavedImage {
  id: string;
  url: string;
  name: string;
  timestamp: Date;
  filters?: any;
}

interface ImageGalleryProps {
  savedImages: SavedImage[];
  onDeleteImage: (id: string) => void;
  onDownloadImage: (image: SavedImage) => void;
}

export const ImageGallery = ({ savedImages, onDeleteImage, onDownloadImage }: ImageGalleryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savedImages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No saved images</p>
          ) : (
            savedImages.map((image) => (
              <div key={image.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{image.name}</p>
                  <p className="text-xs text-gray-500">
                    {image.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadImage(image)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteImage(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
