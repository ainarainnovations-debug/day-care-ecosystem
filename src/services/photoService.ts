import { supabase } from '@/integrations/supabase/client';

export type PhotoType =
  | 'profile'
  | 'child_profile'
  | 'facility'
  | 'activity'
  | 'meal'
  | 'nap'
  | 'play'
  | 'learning'
  | 'message_attachment'
  | 'other';

export interface Photo {
  id: string;
  uploaded_by: string;
  bucket: string;
  path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  type: PhotoType;
  caption?: string;
  child_id?: string;
  provider_id?: string;
  activity_id?: string;
  message_id?: string;
  width?: number;
  height?: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface UploadPhotoOptions {
  file: File;
  type: PhotoType;
  caption?: string;
  childId?: string;
  providerId?: string;
  activityId?: string;
  messageId?: string;
  isPublic?: boolean;
}

class PhotoService {
  private bucketMap: Record<PhotoType, string> = {
    profile: 'profile-photos',
    child_profile: 'child-photos',
    facility: 'facility-photos',
    activity: 'activity-photos',
    meal: 'activity-photos',
    nap: 'activity-photos',
    play: 'activity-photos',
    learning: 'activity-photos',
    message_attachment: 'message-attachments',
    other: 'activity-photos',
  };

  /**
   * Upload a photo to Supabase Storage and create metadata record
   */
  async uploadPhoto(options: UploadPhotoOptions): Promise<Photo> {
    const { file, type, caption, childId, providerId, activityId, messageId, isPublic = false } = options;

    // Get bucket name
    const bucket = this.bucketMap[type];

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Get user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create path based on type
    let path = '';
    switch (type) {
      case 'profile':
        path = `${user.id}/${fileName}`;
        break;
      case 'child_profile':
        path = `children/${childId}/${fileName}`;
        break;
      case 'facility':
        path = `providers/${providerId}/${fileName}`;
        break;
      case 'activity':
      case 'meal':
      case 'nap':
      case 'play':
      case 'learning':
        path = `activities/${activityId || Date.now()}/${fileName}`;
        break;
      case 'message_attachment':
        path = `messages/${messageId || Date.now()}/${fileName}`;
        break;
      default:
        path = `${user.id}/${fileName}`;
    }

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get image dimensions
    const dimensions = await this.getImageDimensions(file);

    // Create metadata record
    const { data: photoData, error: photoError } = await supabase.rpc('create_photo', {
      p_bucket: bucket,
      p_path: uploadData.path,
      p_filename: file.name,
      p_mime_type: file.type,
      p_size_bytes: file.size,
      p_type: type,
      p_caption: caption || null,
      p_child_id: childId || null,
      p_provider_id: providerId || null,
      p_activity_id: activityId || null,
      p_message_id: messageId || null,
      p_width: dimensions?.width || null,
      p_height: dimensions?.height || null,
      p_is_public: isPublic,
    });

    if (photoError) {
      console.error('Photo metadata error:', photoError);
      // Try to clean up uploaded file
      await supabase.storage.from(bucket).remove([uploadData.path]);
      throw photoError;
    }

    // Fetch the created photo
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoData)
      .single();

    if (fetchError) throw fetchError;

    return photo as Photo;
  }

  /**
   * Get image dimensions from file
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    });
  }

  /**
   * Get public URL for a photo
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Get signed URL for private photo (expires in 1 hour)
   */
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    // Get photo details
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .single();

    if (fetchError || !photo) {
      console.error('Photo not found:', fetchError);
      return false;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(photo.bucket)
      .remove([photo.path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return false;
    }

    return true;
  }

  /**
   * Get user's photos
   */
  async getUserPhotos(userId?: string, limit = 50): Promise<Photo[]> {
    let query = supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('uploaded_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Photo[];
  }

  /**
   * Get child's photos
   */
  async getChildPhotos(childId: string, limit = 50): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Photo[];
  }

  /**
   * Get activity photos
   */
  async getActivityPhotos(activityId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Photo[];
  }

  /**
   * Get provider facility photos
   */
  async getFacilityPhotos(providerId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('provider_id', providerId)
      .eq('type', 'facility')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Photo[];
  }

  /**
   * Update profile photo
   */
  async updateProfilePhoto(file: File): Promise<Photo> {
    const photo = await this.uploadPhoto({
      file,
      type: 'profile',
      isPublic: true,
    });

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        profile_photo_url: photo.url,
        profile_photo_id: photo.id,
      })
      .eq('id', photo.uploaded_by);

    if (error) {
      console.error('Profile update error:', error);
    }

    return photo;
  }

  /**
   * Update child profile photo
   */
  async updateChildPhoto(childId: string, file: File): Promise<Photo> {
    const photo = await this.uploadPhoto({
      file,
      type: 'child_profile',
      childId,
      isPublic: false,
    });

    // Update child
    const { error } = await supabase
      .from('children')
      .update({
        photo_url: photo.url,
        photo_id: photo.id,
      })
      .eq('id', childId);

    if (error) {
      console.error('Child update error:', error);
    }

    return photo;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSizeMB = 10): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
    }

    // Check MIME type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  /**
   * Compress image before upload (optional)
   */
  async compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            file.type,
            quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export const photoService = new PhotoService();
