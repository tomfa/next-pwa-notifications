import { useCallback, useEffect, useMemo, useState } from "react";

export const Platform = {
  MAC: "Mac OS",
  IOS: "iOS",
  WINDOWS: "Windows",
  ANDROID: "Android",
  LINUX: "Linux",
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

export const usePlatform = () => {
  const [navigatorPlatform, setNavigatorPlatform] = useState<string>();
  const [userAgent, setUserAgent] = useState<string | null>(null);

  const redetectPlatform = useCallback(() => {
    if (!!navigatorPlatform) {
      return;
    }
    const currentValue = getPlatform();
    if (currentValue) {
      setNavigatorPlatform(currentValue.platform);
      setUserAgent(currentValue.userAgent);
    }
    return currentValue;
  }, [navigatorPlatform]);

  useEffect(() => {
    if (navigatorPlatform) {
      return;
    }
    const value = redetectPlatform();
    if (!value) {
      const timeout = setTimeout(redetectPlatform, 500);
      return () => clearTimeout(timeout);
    }
    setNavigatorPlatform(value.platform);
    setUserAgent(value.userAgent);
  }, [navigatorPlatform, redetectPlatform]);

  const platform: Platform | null = useMemo(() => {
    const macosPlatforms = [
      "Macintosh",
      "macOS",
      "MacIntel",
      "MacPPC",
      "Mac68K",
    ];
    const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
    const iosPlatforms = ["iPhone", "iPad", "iPod"];

    if (!navigatorPlatform) {
      return null;
    }

    if (macosPlatforms.indexOf(navigatorPlatform) !== -1) {
      return Platform.MAC;
    }
    if (iosPlatforms.indexOf(navigatorPlatform) !== -1) {
      return Platform.IOS;
    }
    if (windowsPlatforms.indexOf(navigatorPlatform) !== -1) {
      return Platform.WINDOWS;
    }
    if (!userAgent) {
      return null;
    }
    if (/Android/.test(userAgent)) {
      return Platform.ANDROID;
    }
    if (/Linux/.test(navigatorPlatform)) {
      return Platform.LINUX;
    }
    return null;
  }, [navigatorPlatform, userAgent]);

  return useMemo(
    () => ({
      platform,
      userAgent,
      navigatorPlatform,
      isMobile: platform === Platform.IOS || platform === Platform.ANDROID,
    }),
    [platform, userAgent, navigatorPlatform],
  );
};
const getPlatform = (): { platform: string; userAgent: string } | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const userAgent = window.navigator?.userAgent;
  const platform: string =
    // @ts-expect-error Because browsers are special
    ((window.navigator?.userAgentData as any)?.platform as
      | string
      | undefined) || window?.navigator.platform;

  if (!userAgent && !platform) {
    return null;
  }

  return { platform, userAgent };
};
