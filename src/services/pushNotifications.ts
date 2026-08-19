import { NotificationItem, PushNotificationPreferences } from '../types';
import { api } from './api';

const PREFS_KEY = 'zad_push_notification_prefs_v1';

const DEFAULT_PREFS: PushNotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  notifyOnDonations: true,
  notifyOnStudentAlerts: true,
  notifyOnAnnouncements: true,
  notifyOnFinancials: true,
};

// Play a pleasant chime tone using Web Audio API
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    // Two-tone pleasant notification chime (E5 -> G5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Ignore audio context autoplay limitations if user hasn't interacted yet
  }
}

export const pushNotifications = {
  // Check if browser supports Web Notifications
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  // Get current permission status
  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  // Request browser permission
  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  },

  // Get saved user preferences
  getPreferences(): PushNotificationPreferences {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_PREFS;
  },

  // Save user preferences
  savePreferences(prefs: Partial<PushNotificationPreferences>): PushNotificationPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Show a Native Browser Push Notification
  async showPush(
    title: string,
    body: string,
    options?: {
      type?: NotificationItem['type'];
      tag?: string;
      isUrgent?: boolean;
      onClick?: () => void;
    }
  ): Promise<boolean> {
    const prefs = this.getPreferences();

    // Play sound if enabled
    if (prefs.soundEnabled) {
      playNotificationSound();
    }

    if (!this.isSupported()) {
      return false;
    }

    // Auto-request or check permission
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await this.requestPermission() as NotificationPermission;
    }

    if (perm === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=128&auto=format&fit=crop&q=80',
          badge: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=48&auto=format&fit=crop&q=80',
          dir: 'rtl',
          lang: 'ar',
          tag: options?.tag || `zad-${Date.now()}`,
          requireInteraction: options?.isUrgent || false,
        });

        notif.onclick = () => {
          window.focus();
          if (options?.onClick) {
            options.onClick();
          }
          notif.close();
        };

        return true;
      } catch (e) {
        console.warn('Could not display native notification:', e);
      }
    }
    return false;
  },

  // Dispatch a comprehensive Push Notification and store in Firestore
  async sendNotification(
    item: Omit<NotificationItem, 'id' | 'timestamp' | 'unread' | 'date'> & {
      date?: string;
      unread?: boolean;
    }
  ): Promise<NotificationItem> {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      date: item.date || new Date().toISOString().slice(0, 10),
      unread: item.unread !== undefined ? item.unread : true,
    };

    // Show native OS push notification
    await this.showPush(newItem.title, newItem.body, {
      type: newItem.type,
      isUrgent: newItem.isUrgent,
      tag: newItem.id,
    });

    // Save to Firestore
    try {
      await api.addNotification(newItem);
    } catch (err) {
      console.warn('Could not persist notification to Firestore:', err);
    }

    return newItem;
  },

  // Specialized triggers:
  async notifyNewDonation(donorName: string, amountUSD: number, receiptNumber: string) {
    const prefs = this.getPreferences();
    if (!prefs.notifyOnDonations) return;

    return this.sendNotification({
      title: 'سند تبرع جديد مسجل 💰',
      body: `تم توثيق تبرع جديد بقيمة $${amountUSD.toLocaleString()} من المحسن (${donorName}) برقم سند ${receiptNumber}.`,
      type: 'donation',
      targetTab: 'donations',
      isUrgent: false,
      senderName: 'أمانة الصندوق',
      senderRole: 'النظام المالي',
    });
  },

  async notifyStudentAlert(studentName: string, circleName: string, status: string) {
    const prefs = this.getPreferences();
    if (!prefs.notifyOnStudentAlerts) return;

    const isNegative = status === 'تأخير متكرر' || status === 'منقطع';
    return this.sendNotification({
      title: isNegative ? '⚠️ تنبيه متابعة طالب' : '🌟 تميز أكاديمي لطالب',
      body: `الطالب (${studentName}) في حلقة (${circleName}) أصبحت حالته: ${status}.`,
      type: 'student',
      targetTab: 'persons',
      isUrgent: isNegative,
      senderName: 'المشرف التعليمي',
      senderRole: 'الشؤون التعليمية',
    });
  },

  async notifyAnnouncement(title: string, author: string, isUrgent?: boolean) {
    const prefs = this.getPreferences();
    if (!prefs.notifyOnAnnouncements) return;

    return this.sendNotification({
      title: isUrgent ? '🚨 تعميم إداري عاجل' : '📢 تعميم إداري جديد',
      body: `${title} - صادر عن: ${author}`,
      type: 'announcement',
      targetTab: 'announcements',
      isUrgent,
      senderName: author,
      senderRole: 'الإدارة العامة',
    });
  },

  async notifyFinancialTransaction(description: string, amountUSD: number, type: 'income' | 'expense') {
    const prefs = this.getPreferences();
    if (!prefs.notifyOnFinancials) return;

    const typeStr = type === 'income' ? 'إيراد' : 'مصروف';
    return this.sendNotification({
      title: `قيد مالي جديد (${typeStr})`,
      body: `تم تسجيل قيد (${description}) بقيمة $${amountUSD.toLocaleString()}.`,
      type: 'financial',
      targetTab: 'financials',
      isUrgent: false,
      senderName: 'قسم المحاسبة',
      senderRole: 'الإدارة المالية',
    });
  },
};
