import { useState } from 'react';
import { X, Download, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { photoService, type Photo } from '@/services/photoService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoDeleted?: (photoId: string) => void;
  columns?: 2 | 3 | 4 | 5;
  showActions?: boolean;
  showCaptions?: boolean;
  className?: string;
}

export function PhotoGallery({
  photos,
  onPhotoDeleted,
  columns = 3,
  showActions = true,
  showCaptions = true,
  className,
}: PhotoGalleryProps) {
  const { toast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!photoToDelete) return;

    try {
      setDeleting(true);
      const success = await photoService.deletePhoto(photoToDelete.id);

      if (success) {
        toast({
          title: 'Photo Deleted',
          description: 'Photo has been removed successfully',
        });

        if (onPhotoDeleted) {
          onPhotoDeleted(photoToDelete.id);
        }
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete photo',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setPhotoToDelete(null);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Downloaded',
        description: 'Photo downloaded successfully',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download photo',
        variant: 'destructive',
      });
    }
  };

  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos yet</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('grid gap-4', gridClass[columns], className)}>
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden group relative">
            {/* Photo */}
            <div
              className="aspect-square bg-muted cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>

            {/* Actions Overlay */}
            {showActions && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleDownload(photo)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => setPhotoToDelete(photo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Caption */}
            {showCaptions && photo.caption && (
              <div className="p-2 bg-white dark:bg-gray-900">
                <p className="text-xs text-muted-foreground truncate">
                  {photo.caption}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.caption || 'Photo'}</DialogTitle>
            <DialogDescription>
              Uploaded {selectedPhoto && formatDistanceToNow(new Date(selectedPhoto.created_at), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Photo'}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              {/* Photo Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Filename</p>
                  <p className="font-medium">{selectedPhoto.filename}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">
                    {(selectedPhoto.size_bytes / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {selectedPhoto.width && selectedPhoto.height && (
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {selectedPhoto.width} × {selectedPhoto.height}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedPhoto.type.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => selectedPhoto && handleDownload(selectedPhoto)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setPhotoToDelete(selectedPhoto);
                    setSelectedPhoto(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the photo
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Compact gallery variant (for small spaces)
export function PhotoGalleryCompact({
  photos,
  maxPhotos = 4,
  onViewAll,
}: {
  photos: Photo[];
  maxPhotos?: number;
  onViewAll?: () => void;
}) {
  const displayPhotos = photos.slice(0, maxPhotos);
  const remaining = photos.length - maxPhotos;

  return (
    <div className="grid grid-cols-4 gap-2">
      {displayPhotos.map((photo, index) => (
        <div
          key={photo.id}
          className="aspect-square bg-muted rounded-lg overflow-hidden relative"
        >
          <img
            src={photo.url}
            alt={photo.caption || `Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {index === maxPhotos - 1 && remaining > 0 && (
            <button
              onClick={onViewAll}
              className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold hover:bg-black/70 transition-colors"
            >
              +{remaining}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
