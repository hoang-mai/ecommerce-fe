class WebPushService {
  private registration: ServiceWorkerRegistration | null = null;
  private readonly publicKey: string;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }


  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }
    if(this.registration) return true;

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('Service Worker registered successfully:', this.registration);

      await navigator.serviceWorker.ready;

      console.log('Service Worker is ready');
      return true;
    } catch (error) {
      console.error('Error registering service worker:', error);
      this.registration = null;
      return false;
    }

  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {

      let subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        console.log('Already subscribed:', subscription);
        return subscription;
      }


      const applicationServerKey = this.urlBase64ToUint8Array(this.publicKey);

      // Subscribe to push notifications
      subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });
      console.log('Push subscription successful:', subscription.toJSON());
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        const successful = await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications:', successful);
        return successful;
      }

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Check if user is subscribed to push notifications
   */
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    if (!base64String) {
      throw new Error('Base64 string is empty or undefined');
    }

    try {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      return outputArray;
    } catch (error) {
      console.error('Error converting base64 to Uint8Array:', error);
      throw new Error(`Failed to convert VAPID public key: ${error}`);
    }
  }
  /**
   * Show a local notification (doesn't require push)
   */
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/logo.svg',
        badge: '/logo.svg',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}

const webPushService = new WebPushService();
export default webPushService;

