'use client';
import {useEffect} from "react";
import webPushService from "@/services/webPush";

export default function WebPushProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    webPushService.initialize();
  }, []);
  return null;
}