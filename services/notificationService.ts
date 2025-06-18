import { CyclePhase } from '../types';

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async checkPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    this.permission = Notification.permission;
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async scheduleNotification(title: string, options: NotificationOptions = {}) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/app-icon-192.png',
        badge: '/icons/app-icon-192.png',
        vibrate: [200, 100, 200],
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public async scheduleCycleNotification(phase: CyclePhase, date: Date) {
    const messages = {
      [CyclePhase.MENSTRUAL]: 'Your period is starting soon. Remember to track your symptoms!',
      [CyclePhase.FOLLICULAR]: 'You\'re entering your follicular phase. Time for new beginnings!',
      [CyclePhase.OVULATORY]: 'You\'re in your ovulatory phase. Peak fertility window!',
      [CyclePhase.LUTEAL]: 'You\'re entering your luteal phase. Take care of yourself!'
    };

    await this.scheduleNotification('Cycle Update', {
      body: messages[phase],
      tag: 'cycle-update',
      requireInteraction: true
    });
  }

  public async scheduleMoodCheckNotification() {
    await this.scheduleNotification('Daily Mood Check-in', {
      body: 'How are you feeling today? Take a moment to log your mood.',
      tag: 'mood-check',
      requireInteraction: true
    });
  }
}

export const notificationService = NotificationService.getInstance(); 