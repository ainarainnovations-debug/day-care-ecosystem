import { useState } from 'react';
import { Download, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import type { Photo } from '@/services/photoService';
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

export function PhotoGallery({ photos, onPhotoDeleted, columns = 3, showActions = true, showCaptions = true, className }: PhotoGalleryProps) {
  const { toast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

  const handleDelete = () => {
    if (!photoToDelete) return;
    toast({ title: 'Photo Deleted', description: 'Photo has been removed' });
    onPhotoDeleted?.(photoToDelete.id);
    setPhotoToDelete(null);
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.photo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo-${photo.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Download Failed', variant: 'destructive' });
    }
  };

  const gridClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', 5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' };

  if (photos.length === 0) return <div className="text-center py-12"><p className="text-muted-foreground">No photos yet</p></div>;

  return (
    <>
      <div className={cn('grid gap-4', gridClass[columns], className)}>
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden group relative">
            <div className="aspect-square bg-muted cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
              <img src={photo.photo_url} alt={photo.caption || 'Photo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
            </div>
            {showActions && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" onClick={() => setSelectedPhoto(photo)}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="secondary" onClick={() => handleDownload(photo)}><Download className="h-4 w-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => setPhotoToDelete(photo)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            )}
            {showCaptions && photo.caption && <div className="p-2"><p className="text-xs text-muted-foreground truncate">{photo.caption}</p></div>}
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.caption || 'Photo'}</DialogTitle>
            <DialogDescription>
              Uploaded {selectedPhoto && formatDistanceToNow(new Date(selectedPhoto.created_at), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <img src={selectedPhoto.photo_url} alt={selectedPhoto.caption || 'Photo'} className="w-full h-auto max-h-[70vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function PhotoGalleryCompact({ photos, maxPhotos = 4, onViewAll }: { photos: Photo[]; maxPhotos?: number; onViewAll?: () => void }) {
  const displayPhotos = photos.slice(0, maxPhotos);
  const remaining = photos.length - maxPhotos;

  return (
    <div className="grid grid-cols-4 gap-2">
      {displayPhotos.map((photo, index) => (
        <div key={photo.id} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
          <img src={photo.photo_url} alt={photo.caption || `Photo ${index + 1}`} className="w-full h-full object-cover" />
          {index === maxPhotos - 1 && remaining > 0 && (
            <button onClick={onViewAll} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">+{remaining}</button>
          )}
        </div>
      ))}
    </div>
  );
}
