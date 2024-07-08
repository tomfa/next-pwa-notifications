import { useCallback, useEffect, useMemo, useState } from "react";
import { env } from "@/env";

export const useServiceWorker = () => {
  const [isSupported, setSupported] = useState<boolean>();

  const [sw, setSw] = useState<ServiceWorkerRegistration | null>(null);
  const [pushPermission, setPushPermission] =
    useState<PushSubscription | null>();

  useEffect(() => {
    const isSupported =
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      typeof postMessage === "function";
    setSupported(isSupported);
    if (isSupported) {
      navigator.serviceWorker.ready
        .then((sw) => {
          setSw(sw);
        })
        .catch((err) => {
          console.log(err);
          setSw(null);
        });
    }
  }, [isSupported]);

  const register = useCallback(async () => {
    if (!isSupported) {
      return { error: "Notifications are not supported on your device" };
    }
    if (sw) {
      return { error: null, sw };
    }
    try {
      const sw = await navigator.serviceWorker.register("/sw.js");
      setSw(sw);
      return { error: null, sw };
    } catch (e) {
      console.log(e);
      setSw(null);
      return { error: "Failed to install service worker", sw: null };
    }
  }, [sw, isSupported]);

  const sendEvent = useCallback(
    async (title: string, body?: string) => {
      if (!isSupported) {
        return false;
      }
      if (typeof postMessage !== "function") {
        return false;
      }
      postMessage({ title, body });
    },
    [isSupported],
  );

  const showNotification = useCallback(
    async (title: string, body?: string) => {
      if (!isSupported) {
        return false;
      }
      const { sw } = await register();
      if (!sw) {
        return false;
      }
      await sw.showNotification(
        title,
        body
          ? {
              body,
              icon: "/img/pwa/bg.svg", // Note: Icon not supported on iOS
            }
          : undefined,
      );
    },
    [register, isSupported],
  );

  const unRegister = useCallback(async () => {
    if (sw) {
      await sw.unregister();
    }
  }, [sw]);

  const requestPushPermission = useCallback(async () => {
    if (!sw) {
      return;
    }

    const response = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: env.NEXT_PUBLIC_PUSH_API_KEY,
    });
    setPushPermission(response);

    return response;
  }, [sw]);

  useEffect(() => {
    if (!sw || pushPermission !== undefined || !sw.pushManager) {
      return;
    }

    sw.pushManager
      .getSubscription()
      .then((subscription) => {
        setPushPermission(subscription);
      })
      .catch((err) => {
        console.log(err);
        console.log(`Error while getting push subscription`);
      });
  }, [pushPermission, sw]);

  return {
    register,
    isSupported,
    sendEvent,
    isInstalled: !!sw,
    unRegister,
    showNotification,
    requestPushPermission,
    supportsPushManager: !!sw?.pushManager,
    pushPermission,
    hasPushPermission: !!pushPermission,
    data: {
      scope: sw?.scope,
      active: sw?.active,
      installing: sw?.installing,
      waiting: sw?.waiting,
    },
  };
};
