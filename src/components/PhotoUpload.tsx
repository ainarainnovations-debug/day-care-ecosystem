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
  messageId?: string;
  isPublic?: boolean;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  showPreview?: boolean;
}

export function PhotoUpload({
  type,
  onUploadComplete,
  onUploadError,
  childId,
  providerId,
  activityId,
  messageId,
  isPublic = false,
  maxSizeMB = 10,
  accept = 'image/*',
  multiple = false,
  className,
  buttonText = 'Upload Photo',
  buttonVariant = 'outline',
  showPreview = true,
}: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Handle first file only for now

    // Validate file
    const validation = photoService.validateFile(file, maxSizeMB);
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive',
      });
      if (onUploadError) {
        onUploadError(new Error(validation.error));
      }
      return;
    }

    // Show preview
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload
    try {
      setUploading(true);
      setProgress(0);

      // Simulate progress (Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Compress image if it's an image
      const fileToUpload = file.type.startsWith('image/')
        ? await photoService.compressImage(file)
        : file;

      const photo = await photoService.uploadPhoto({
        file: fileToUpload,
        type,
        childId,
        providerId,
        activityId,
        messageId,
        isPublic,
      });

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: 'Success!',
        description: 'Photo uploaded successfully',
      });

      if (onUploadComplete) {
        onUploadComplete(photo.url, photo.id);
      }

      // Reset after delay
      setTimeout(() => {
        setPreview(null);
        setProgress(0);
        setUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error('Upload failed'));
      }
      setUploading(false);
      setPreview(null);
      setProgress(0);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Button */}
      {!preview && !uploading && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant={buttonVariant}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </div>
      )}

      {/* Preview */}
      {preview && showPreview && (
        <Card className="p-4 relative">
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg max-h-64 object-contain"
          />
        </Card>
      )}

      {/* Upload Progress */}
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

// Drag and Drop variant
export function PhotoUploadDropzone({
  type,
  onUploadComplete,
  onUploadError,
  childId,
  providerId,
  activityId,
  messageId,
  isPublic = false,
  maxSizeMB = 10,
  className,
}: Omit<PhotoUploadProps, 'buttonText' | 'buttonVariant' | 'showPreview' | 'multiple' | 'accept'>) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    await uploadFile(files[0]);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadFile(files[0]);
  };

  const uploadFile = async (file: File) => {
    // Validate
    const validation = photoService.validateFile(file, maxSizeMB);
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive',
      });
      if (onUploadError) {
        onUploadError(new Error(validation.error));
      }
      return;
    }

    // Upload
    try {
      setUploading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const fileToUpload = file.type.startsWith('image/')
        ? await photoService.compressImage(file)
        : file;

      const photo = await photoService.uploadPhoto({
        file: fileToUpload,
        type,
        childId,
        providerId,
        activityId,
        messageId,
        isPublic,
      });

      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: 'Success!',
        description: 'Photo uploaded successfully',
      });

      if (onUploadComplete) {
        onUploadComplete(photo.url, photo.id);
      }

      setTimeout(() => {
        setProgress(0);
        setUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error('Upload failed'));
      }
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileInput}
        className="hidden"
        id="dropzone-file"
        disabled={uploading}
      />

      <label
        htmlFor="dropzone-file"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
          uploading && 'cursor-not-allowed opacity-60'
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium">Uploading...</p>
            <Progress value={progress} className="w-48 h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ImageIcon className="h-10 w-10 text-gray-400 mb-4" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </label>
    </div>
  );
}
