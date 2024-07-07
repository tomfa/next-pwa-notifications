import { useCallback, useEffect, useState } from "react";

export const Platform = {
  MAC: "Mac OS",
  IOS: "iOS",
  WINDOWS: "Windows",
  ANDROID: "Android",
  LINUX: "Linux",
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

export const usePlatform = () => {
  const [platform, setPlatform] = useState<Platform | null>(null);

  const redetectPlatform = useCallback(() => {
    if (platform !== null) {
      return;
    }
    const currentValue = getPlatform();
    if (currentValue) {
      setPlatform(currentValue);
    }
    return currentValue;
  }, [platform]);

  useEffect(() => {
    if (platform) {
      return;
    }
    const foundPlatform = redetectPlatform();
    if (!foundPlatform) {
      const timeout = setTimeout(redetectPlatform, 500);
      return () => clearTimeout(timeout);
    }
    setPlatform(foundPlatform);
  }, [platform, redetectPlatform]);

  return platform;
};
const getPlatform = (): Platform | null => {
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

  const macosPlatforms = ["Macintosh", "macOS", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iosPlatforms = ["iPhone", "iPad", "iPod"];

  if (macosPlatforms.indexOf(platform) !== -1) {
    return Platform.MAC;
  }
  if (iosPlatforms.indexOf(platform) !== -1) {
    return Platform.IOS;
  }
  if (windowsPlatforms.indexOf(platform) !== -1) {
    return Platform.WINDOWS;
  }
  if (/Android/.test(userAgent)) {
    return Platform.ANDROID;
  }
  if (/Linux/.test(platform)) {
    return Platform.LINUX;
  }

  return null;
};
