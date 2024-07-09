import { useCallback, useEffect, useMemo, useState } from "react";
import { UAParser } from "ua-parser-js";

export const Browser = {
  OPERA: "Opera",
  FIREFOX: "Firefox",
  SAFARI: "Safari",
  IE: "Internet Explorer",
  EDGE: "Edge",
  CHROME: "Chrome",
} as const;

export type Browser = (typeof Browser)[keyof typeof Browser];

export const useBrowser = () => {
  const [browser, setBrowser] = useState<Browser | null>(null);
  const [userAgent, setUserAgent] = useState<string | null>(null);

  const redetectBrowser = useCallback(() => {
    const currentValue = getBrowser();
    if (currentValue) {
      setBrowser(currentValue.browser);
      setUserAgent(currentValue.userAgent);
    }
    return currentValue;
  }, []);

  useEffect(() => {
    if (browser) {
      return;
    }
    const foundBrowser = redetectBrowser();
    if (foundBrowser) {
      setBrowser(foundBrowser.browser);
      setUserAgent(foundBrowser.userAgent);
    }
    const timeout = setTimeout(redetectBrowser, 1500);
    return () => clearTimeout(timeout);
  }, [browser, redetectBrowser]);

  return useMemo(() => ({ browser, userAgent }), [browser, userAgent]);
};
const getBrowser = (): { browser: Browser; userAgent: string } | null => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const parser = new UAParser(navigator.userAgent);
  const isOpera = parser.getBrowser().name === "Opera";

  if (isOpera) {
    return { browser: Browser.OPERA, userAgent: navigator.userAgent };
  }

  const isFirefox = parser.getBrowser().name === "Firefox";
  if (isFirefox) {
    return { browser: Browser.FIREFOX, userAgent: navigator.userAgent };
  }

  const isSafari = parser.getBrowser().name?.endsWith("Safari");
  if (isSafari) {
    return { browser: Browser.SAFARI, userAgent: navigator.userAgent };
  }

  const isIE = parser.getBrowser().name?.startsWith("IE");
  if (isIE) {
    return { browser: Browser.IE, userAgent: navigator.userAgent };
  }

  const isEdge = parser.getBrowser().name === "Edge";
  if (isEdge) {
    return { browser: Browser.EDGE, userAgent: navigator.userAgent };
  }

  const isChrome = parser.getBrowser().name === "Chrome";
  if (isChrome) {
    return { browser: Browser.CHROME, userAgent: navigator.userAgent };
  }

  return {
    browser: parser.getBrowser().name as any,
    userAgent: navigator.userAgent,
  };
};
