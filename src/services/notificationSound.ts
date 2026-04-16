/**
 * Notification Sound System
 * 
 * Plays notification sounds using Web Audio API
 * Provides different sounds for different notification types
 */

class NotificationSoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Initialize on user interaction (required by browsers)
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.initialize(), { once: true });
    }
  }

  private initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play a notification sound
   */
  play(type: 'default' | 'success' | 'alert' | 'message' = 'default') {
    if (!this.enabled || !this.audioContext) {
      this.initialize();
      if (!this.audioContext) return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set sound based on type
      const sounds = {
        default: { frequency: 800, duration: 0.15 },
        success: { frequency: 1000, duration: 0.2 },
        alert: { frequency: 600, duration: 0.3 },
        message: { frequency: 900, duration: 0.1 },
      };

      const sound = sounds[type];
      oscillator.frequency.value = sound.frequency;
      oscillator.type = 'sine';

      // Set volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.volume,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + sound.duration
      );

      // Play sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + sound.duration);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  /**
   * Play sound based on notification type
   */
  playForNotificationType(notificationType: string) {
    const soundMap: Record<string, 'default' | 'success' | 'alert' | 'message'> = {
      child_check_in: 'success',
      child_check_out: 'success',
      teacher_clock_in: 'default',
      teacher_clock_out: 'default',
      booking_confirmed: 'success',
      booking_cancelled: 'alert',
      message_received: 'message',
      payment_received: 'success',
      payment_due: 'alert',
      time_entry_approved: 'success',
      time_entry_rejected: 'alert',
      review_received: 'default',
      activity_logged: 'default',
      alert: 'alert',
      system: 'default',
    };

    const soundType = soundMap[notificationType] || 'default';
    this.play(soundType);
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('notification-sounds-enabled', String(enabled));
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    const stored = localStorage.getItem('notification-sounds-enabled');
    if (stored !== null) {
      this.enabled = stored === 'true';
    }
    return this.enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('notification-sounds-volume', String(this.volume));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    const stored = localStorage.getItem('notification-sounds-volume');
    if (stored !== null) {
      this.volume = parseFloat(stored);
    }
    return this.volume;
  }
}

// Export singleton instance
export const notificationSound = new NotificationSoundManager();
