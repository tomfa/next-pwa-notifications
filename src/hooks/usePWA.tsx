"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type InstallStatus = {
  isInstallAllowed: boolean;
  isInstallWaitingConfirm: boolean;
  isInstalling: boolean;
  isInstallCancelled: boolean;
  isInstallSuccess: boolean;
  isInstallFailed: boolean;
};

interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const createStatus = (object: any): InstallStatus => {
  return {
    isInstallAllowed: Object.prototype.hasOwnProperty.call(
      object,
      "isInstallAllowed",
    )
      ? (object.isInstallAllowed as boolean)
      : false,
    isInstallWaitingConfirm: Object.prototype.hasOwnProperty.call(
      object,
      "isInstallWaitingConfirm",
    )
      ? object.isInstallWaitingConfirm
      : false,
    isInstalling: Object.prototype.hasOwnProperty.call(object, "isInstalling")
      ? object.isInstalling
      : false,
    isInstallCancelled: Object.prototype.hasOwnProperty.call(
      object,
      "isInstallCancelled",
    )
      ? object.isInstallCancelled
      : false,
    isInstallSuccess: Object.prototype.hasOwnProperty.call(
      object,
      "isInstallSuccess",
    )
      ? object.isInstallSuccess
      : false,
    isInstallFailed: Object.prototype.hasOwnProperty.call(
      object,
      "isInstallFailed",
    )
      ? object.isInstallFailed
      : false,
  };
};

const usePWA = () => {
  const [initialized, setInitialized] = useState(false);
  const [installStatus, setInstallStatus] = useState<InstallStatus>(
    createStatus({}),
  );
  const [installEvent, setInstallEvent] =
    useState<IBeforeInstallPromptEvent | null>(null);
  const [isHttps, setIsHttps] = useState<boolean>();

  const beforeAppInstallpromptHandler = useCallback(
    (e: Event) => {
      e.preventDefault();
      if (!installStatus.isInstalling) {
        if (!installStatus.isInstallSuccess) {
          setInstallEvent(e as IBeforeInstallPromptEvent);
          if (!installStatus.isInstallAllowed) {
            setInstallStatus(
              createStatus({
                isInstallAllowed: true,
                isInstallCancelled: installStatus.isInstallCancelled,
              }),
            );
          }
        }
      }
    },
    [
      installStatus.isInstallAllowed,
      installStatus.isInstallCancelled,
      installStatus.isInstallSuccess,
      installStatus.isInstalling,
    ],
  );

  const appInstalledHandler = useCallback(
    (e: Event) => {
      if (typeof window === "undefined") {
        return;
      }
      if (!installStatus.isInstallSuccess) {
        window.removeEventListener("beforeinstallprompt", (e) =>
          beforeAppInstallpromptHandler(e as IBeforeInstallPromptEvent),
        );
        e.preventDefault();
        setInstallStatus(createStatus({ isInstallSuccess: true }));
      }
    },
    [beforeAppInstallpromptHandler, installStatus.isInstallSuccess],
  );

  const initializeWindow = useCallback(
    (window: Window) => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setInstallStatus((s) => ({ ...s, isInstallSuccess: true }));
        setInitialized(true);
        return;
      }
      window.addEventListener(
        "beforeinstallprompt",
        beforeAppInstallpromptHandler,
      );
      window.addEventListener("appinstalled", appInstalledHandler);
      setIsHttps(window.location.protocol === "https:");
      setInitialized(true);
      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          beforeAppInstallpromptHandler,
        );
        window.removeEventListener("appinstalled", appInstalledHandler);
      };
    },
    [appInstalledHandler, beforeAppInstallpromptHandler],
  );

  useEffect(() => {
    if (initialized) {
      return;
    }

    if (typeof window === "undefined") {
      const timeout = setTimeout(() => {
        if (typeof window !== "undefined") {
          initializeWindow(window);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
    initializeWindow(window);
  }, [initialized, initializeWindow]);

  const prompt = useCallback(async () => {
    if (!installEvent) {
      return;
    }
    setInstallStatus(createStatus({ isInstallWaitingConfirm: true }));
    await installEvent.prompt();
    installEvent.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          setInstallStatus(
            createStatus({ isInstalling: true, isInstallAllowed: false }),
          );
        } else {
          setInstallStatus(
            createStatus({ isInstallCancelled: true, isInstallAllowed: true }),
          );
        }
      })
      .catch(() => {
        setInstallStatus(
          createStatus({ isInstallFailed: true, isInstallAllowed: true }),
        );
      });
    setInstallEvent(null);
  }, [installEvent]);

  return useMemo(
    () => ({
      isInstallAllowed: installStatus.isInstallAllowed,
      isInstalled: installStatus.isInstallSuccess,
      isHttps,
      prompt: prompt,
      initialize: () => {
        if (typeof window !== "undefined") {
          initializeWindow(window);
        }
      },
      isInitialized: initialized,
    }),
    [
      initializeWindow,
      initialized,
      installStatus.isInstallAllowed,
      installStatus.isInstallSuccess,
      isHttps,
      prompt,
    ],
  );
};

const PWAContext = createContext<ReturnType<typeof usePWA> | null>(null);
export const ProgressiveWebAppProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const value = usePWA();
  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const useProgressiveWebApp = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error(
      "useProgressiveWebApp must be used within a ProgressiveWebAppProvider",
    );
  }
  if (!context.isInitialized) {
    context.initialize();
  }
  return context;
};
