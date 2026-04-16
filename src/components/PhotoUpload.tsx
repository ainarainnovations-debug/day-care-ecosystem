import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { photoService, type PhotoType } from '@/services/photoService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface PhotoUploadProps {
  type: PhotoType;
  onUploadComplete?: (photoUrl: string, photoId: string) => void;
  onUploadError?: (error: Error) => void;
  childId?: string;
  providerId?: string;
  activityId?: string;
  isPublic?: boolean;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  showPreview?: boolean;
}

export function PhotoUpload({ type, onUploadComplete, onUploadError, childId, providerId, activityId, isPublic = false, maxSizeMB = 10, accept = 'image/*', multiple = false, className, buttonText = 'Upload Photo', buttonVariant = 'outline', showPreview = true }: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const validation = photoService.validateFile(file, maxSizeMB);
    if (!validation.valid) {
      toast({ title: 'Invalid File', description: validation.error, variant: 'destructive' });
      onUploadError?.(new Error(validation.error));
      return;
    }

    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    try {
      setUploading(true);
      setProgress(0);
      const progressInterval = setInterval(() => setProgress((prev) => Math.min(prev + 10, 90)), 200);
      const fileToUpload = file.type.startsWith('image/') ? await photoService.compressImage(file) : file;
      const photo = await photoService.uploadPhoto({ file: fileToUpload, type, childId, providerId, activityId, isPublic });
      clearInterval(progressInterval);
      setProgress(100);
      toast({ title: 'Success!', description: 'Photo uploaded successfully' });
      onUploadComplete?.(photo.photo_url, photo.id);
      setTimeout(() => { setPreview(null); setProgress(0); setUploading(false); }, 1000);
    } catch (error) {
      toast({ title: 'Upload Failed', description: error instanceof Error ? error.message : 'Failed', variant: 'destructive' });
      onUploadError?.(error instanceof Error ? error : new Error('Upload failed'));
      setUploading(false);
      setPreview(null);
      setProgress(0);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!preview && !uploading && (
        <div>
          <input ref={fileInputRef} type="file" accept={accept} multiple={multiple} onChange={handleFileSelect} className="hidden" disabled={uploading} />
          <Button variant={buttonVariant} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />{buttonText}
          </Button>
        </div>
      )}
      {preview && showPreview && (
        <Card className="p-4 relative">
          <button onClick={() => setPreview(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white" disabled={uploading}><X className="h-4 w-4" /></button>
          <img src={preview} alt="Preview" className="w-full h-auto rounded-lg max-h-64 object-contain" />
        </Card>
      )}
      {uploading && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Uploading...</p>
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
        </Card>
      )}
    </div>
  );
}

export function PhotoUploadDropzone({ type, onUploadComplete, onUploadError, childId, providerId, activityId, isPublic = false, maxSizeMB = 10, className }: Omit<PhotoUploadProps, 'buttonText' | 'buttonVariant' | 'showPreview' | 'multiple' | 'accept'>) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File) => {
    const validation = photoService.validateFile(file, maxSizeMB);
    if (!validation.valid) {
      toast({ title: 'Invalid File', description: validation.error, variant: 'destructive' });
      onUploadError?.(new Error(validation.error));
      return;
    }
    try {
      setUploading(true);
      setProgress(0);
      const progressInterval = setInterval(() => setProgress((prev) => Math.min(prev + 10, 90)), 200);
      const fileToUpload = file.type.startsWith('image/') ? await photoService.compressImage(file) : file;
      const photo = await photoService.uploadPhoto({ file: fileToUpload, type, childId, providerId, activityId, isPublic });
      clearInterval(progressInterval);
      setProgress(100);
      toast({ title: 'Success!', description: 'Photo uploaded' });
      onUploadComplete?.(photo.photo_url, photo.id);
      setTimeout(() => { setProgress(0); setUploading(false); }, 1000);
    } catch (error) {
      toast({ title: 'Upload Failed', variant: 'destructive' });
      onUploadError?.(error instanceof Error ? error : new Error('Upload failed'));
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input type="file" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} className="hidden" id="dropzone-file" disabled={uploading} />
      <label htmlFor="dropzone-file" onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files?.[0] && uploadFile(e.dataTransfer.files[0]); }}
        className={cn('flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors', isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary', uploading && 'cursor-not-allowed opacity-60')}>
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <Progress value={progress} className="w-48 h-2 mt-4" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to {maxSizeMB}MB</p>
          </div>
        )}
      </label>
    </div>
  );
}
