import {useState, useEffect, useCallback} from 'react';
import webPushService from '@/services/webPush';
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {PUSH_SUBSCRIPTION} from "@/services/api";


interface UsePushNotificationReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
}

export function usePushNotification(): UsePushNotificationReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const {post, del} = useAxiosContext();
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window === 'undefined') return false;
      return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    };

    setIsSupported(checkSupport());

    if (checkSupport()) {
      setPermission(webPushService.getPermissionStatus());
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const subscribed = await webPushService.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {

      const initialized = await webPushService.initialize();
      if (!initialized) {
        console.error('Failed to initialize service worker');
        return 'denied';
      }

      const perm = await webPushService.requestPermission();
      setPermission(perm);
      return perm;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    try {
      const initialized = await webPushService.initialize();
      if (!initialized) {
        console.error('Failed to initialize web push');
        setIsLoading(false);
        return false;
      }

      if (permission !== 'granted') {
        const perm = await webPushService.requestPermission();
        setPermission(perm);

        if (perm !== 'granted') {
          console.warn('Notification permission not granted');
          setIsLoading(false);
          return false;
        }
      }

      const subscription = await webPushService.subscribe();
      if (!subscription) {
        console.error('Failed to subscribe to push notifications');
        setIsLoading(false);
        return false;
      }

      await post(`${PUSH_SUBSCRIPTION}/subscribe`, subscription.toJSON());

      setIsSubscribed(true);
      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, post]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    try {

      const subscription = await webPushService.getSubscription();
      if (!subscription) {
        console.warn('No active subscription found');
        setIsSubscribed(false);
        return true;
      }
      const success = await webPushService.unsubscribe();
      if (!success) {
        console.error('Failed to unsubscribe from push notifications');
        return false;
      }

      await del(`${PUSH_SUBSCRIPTION}/unsubscribe?endpoint=${subscription.toJSON().endpoint}`);


      setIsSubscribed(false);
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [del, isSupported]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}

