'use client';

import {useEffect, ReactNode, useState} from 'react';
import WebSocketService from '@/services/webSocket';
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {useRouter} from "next/navigation";


interface WebSocketProviderProps {
  children: ReactNode;
}

export default function WebSocketProvider({children}: WebSocketProviderProps) {
  const [notification, setNotification] = useState<NotificationState>();
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wsUrl = process.env.NEXT_PUBLIC_WEB_SOCKET_URL;
    if (!wsUrl) {
      console.log('NEXT_PUBLIC_WEB_SOCKET_URL is not defined');
      return;
    }
    const connectWebSocket = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.log('Access token is not available');
        return;
      }
      WebSocketService.disconnect();
      WebSocketService.initialize(wsUrl, {
        debug: true,
        reconnectDelay: 5000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        onConnect: () => {

          WebSocketService.subscribe('/user/queue/notify', (data: NotificationState) => {
            console.log('New personal notification:', data);
            setNotification(data);
          });


          WebSocketService.subscribe('/topic/messages', (data: NotificationState) => {
            console.log('New message:', data);
          });
        },
        onError:
          (error) => {
            console.error('WebSocket error:', error);
          },
        onDisconnect:
          () => {
            console.log('WebSocket disconnected');
          }
      });
    }
    connectWebSocket();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.newValue) {
        connectWebSocket();
      }
    };
    const handleAuthChange = () => {
      connectWebSocket();
    };
    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      WebSocketService.disconnect();
    };
  }, []);
  useEffect(() => {
    if (notification) {
      const alert: AlertState = {
        isOpen: true,
        title: notification.title,
        message: notification.message,
        type: notification.notificationType,
      }
      dispatch(openAlert(alert));
      router.push("/");
    }
  }, [dispatch, notification, router]);
  return <>{children}</>;
}