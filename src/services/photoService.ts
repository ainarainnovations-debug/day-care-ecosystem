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
  photo_url: string;
  caption?: string | null;
  created_at: string;
  activity_log_id?: string;
}

export interface UploadPhotoOptions {
  file: File;
  type: PhotoType;
  caption?: string;
  childId?: string;
  providerId?: string;
  activityId?: string;
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

  async uploadPhoto(options: UploadPhotoOptions): Promise<Photo> {
    const { file, type, caption, childId, providerId, activityId, isPublic = false } = options;
    const bucket = this.bucketMap[type];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let path = `${user.id}/${fileName}`;
    if (type === 'child_profile') path = `children/${childId}/${fileName}`;
    else if (type === 'facility') path = `providers/${providerId}/${fileName}`;
    else if (['activity', 'meal', 'nap', 'play', 'learning'].includes(type))
      path = `activities/${activityId || Date.now()}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

    // If there's an activity, store in activity_photos
    if (activityId) {
      const { data, error } = await supabase
        .from('activity_photos')
        .insert({
          activity_log_id: activityId,
          photo_url: urlData.publicUrl,
          caption: caption || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Photo;
    }

    return {
      id: uploadData.path,
      photo_url: urlData.publicUrl,
      caption,
      created_at: new Date().toISOString(),
    };
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }

  async getActivityPhotos(activityId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('activity_photos')
      .select('*')
      .eq('activity_log_id', activityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Photo[];
  }

  async updateProfilePhoto(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const photo = await this.uploadPhoto({ file, type: 'profile', isPublic: true });

    await supabase
      .from('profiles')
      .update({ avatar_url: photo.photo_url })
      .eq('user_id', user.id);

    return photo.photo_url;
  }

  async updateChildPhoto(childId: string, file: File): Promise<string> {
    const photo = await this.uploadPhoto({ file, type: 'child_profile', childId, isPublic: false });

    await supabase
      .from('children')
      .update({ photo_url: photo.photo_url })
      .eq('id', childId);

    return photo.photo_url;
  }

  validateFile(file: File, maxSizeMB = 10): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) return { valid: false, error: 'File type not supported' };

    return { valid: true };
  }

  async compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
              else resolve(file);
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

export const photoService = new PhotoService();
