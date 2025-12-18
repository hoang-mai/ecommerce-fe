'use client';

import {ReactNode, useEffect, useState} from 'react';
import webSocketService from '@/services/webSocket';
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {receiveMessage} from "@/redux/slice/chatSlice";
import {useRouter} from "next/navigation";
import {MessageDTO} from "@/types/interface";
import {NotificationType, AlertType} from "@/types/enum";


interface WebSocketProviderProps {
  children: ReactNode;
}

export default function WebSocketProvider({children}: WebSocketProviderProps) {
  const [notification, setNotification] = useState<NotificationState>();
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    const wsUrl = process.env.NEXT_PUBLIC_WEB_SOCKET_URL;
    if (!wsUrl) {
      console.log('NEXT_PUBLIC_WEB_SOCKET_URL is not defined');
      return;
    }
    const connectWebSocket = () => {
      const accessToken = localStorage.getItem('accessToken');

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      webSocketService.disconnect();
      if (!accessToken) {
        console.log('Access token is not available');
        return;
      }
      webSocketService.initialize(wsUrl, {
        reconnectDelay: 5000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        onConnect: () => {

          webSocketService.subscribe('/user/queue/notify', (data: NotificationState) => {
            console.log('New personal notification:', data);
            setNotification(data);
          });

          webSocketService.subscribe('/user/queue/messages', (data: MessageDTO)=>{
            console.log('New personal message:', data);
            dispatch(receiveMessage(data));
          })

          webSocketService.subscribe('/topic/messages', (data: NotificationState) => {
            console.log('New message:', data);
          });

          heartbeatInterval = setInterval(() => {
            webSocketService.sendHeartbeat()
          }, 20000);
        },
        onError:
          (error) => {
            console.error('WebSocket error:', error);
          },
        onDisconnect:
          () => {
            console.log('WebSocket disconnected');
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }
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
      webSocketService.disconnect();
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    };
  }, [dispatch]);
  useEffect(() => {
    if (notification) {
      if(notification.notificationType === NotificationType.PAYMENT){
        window.location.replace(notification.message);
        return;
      }
      const alert: AlertState = {
        isOpen: true,
        title: notification.title,
        message: notification.message,
        type: notification.notificationType as unknown as AlertType,
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, notification, router]);
  return <>{children}</>;
}