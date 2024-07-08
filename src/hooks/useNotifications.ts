"use client";

import { useCallback, useEffect, useState } from "react";
import { useServiceWorker } from "./useServiceWorker";

export const useNotifications = () => {
  const [isSupported, setSupported] = useState<boolean>();
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setSupported(false);
      setPermission(null);
      return;
    }
    setSupported(true);
    setPermission(Notification.permission);
  }, []);

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

  const sendMessage = useCallback(
    (title: string, body?: string) => {
      if (!hasPermission) {
        return false;
      }
      const options: NotificationOptions = {
        body: body || "",
        icon: "/img/pwa/bg.svg", // Note: Icon not supported on iOS
      };
      return new Notification(title, options);
    },
    [hasPermission],
  );

  return {
    requestNotificationPermission,
    hasPermission,
    permission,
    isSupported,
    sendMessage,
  };
};
