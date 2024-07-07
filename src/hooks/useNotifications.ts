"use client";

import { useCallback, useState } from "react";
import { useServiceWorker } from "./useServiceWorker";

export const useNotifications = () => {
  const sw = useServiceWorker();
  const isSupported = typeof Notification !== "undefined";
  const [permission, setPermission] = useState<null | NotificationPermission>(
    isSupported ? Notification.permission : null,
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!isSupported) {
      return { error: "Notifications are not supported on your device" };
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "denied") {
      return { error: "Your device has disabled notifications for this app." };
    }
    return { error: null };
  }, [isSupported]);
  const hasPermission = isSupported && permission === "granted";
  const swShowNotif = sw.showNotification;
  const swSupported = sw.isSupported;

  const sendMessage = useCallback(
    (title: string, body?: string) => {
      if (!hasPermission || !swSupported) {
        return false;
      }
      return swShowNotif(title, body);
    },
    [hasPermission, swSupported, swShowNotif],
  );

  return {
    requestNotificationPermission,
    hasPermission,
    isSupported,
    sendMessage,
  };
};
