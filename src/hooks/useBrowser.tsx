import { useCallback, useEffect, useMemo, useState } from "react";

export const Browser = {
  OPERA: "Opera",
  FIREFOX: "Firefox",
  SAFARI: "Safari",
  IE: "Internet Explorer",
  EDGE: "Edge",
  CHROME: "Chrome",
  BLINK: "Blink",
  ARC: "Arc",
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
  // Opera 8.0+
  const isOpera =
    // @ts-ignore
    (!!window.opr && !!opr.addons) ||
    // @ts-ignore
    !!window.opera ||
    navigator.userAgent.indexOf(" OPR/") >= 0;

  if (isOpera) {
    return { browser: Browser.OPERA, userAgent: navigator.userAgent };
  }

  // Firefox 1.0+
  // @ts-ignore
  const isFirefox = typeof InstallTrigger !== "undefined";
  if (isFirefox) {
    return { browser: Browser.FIREFOX, userAgent: navigator.userAgent };
  }

  // Safari 3.0+ "[object HTMLElementConstructor]"
  const isSafari =
    // @ts-ignore
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(
      // @ts-ignore
      !window.safari ||
        // @ts-ignore
        (typeof safari !== "undefined" && safari.pushNotification),
    );
  if (isSafari) {
    return { browser: Browser.SAFARI, userAgent: navigator.userAgent };
  }

  // Internet Explorer 6-11
  // @ts-ignore
  const isIE = /*@cc_on!@*/ false || !!document.documentMode;
  if (isIE) {
    return { browser: Browser.IE, userAgent: navigator.userAgent };
  }

  // Edge 20+
  // @ts-ignore
  const isEdge = !isIE && !!window.StyleMedia;
  if (isEdge) {
    return { browser: Browser.EDGE, userAgent: navigator.userAgent };
  }

  // Does not work until after document is finished loading.
  const isArc = !!getComputedStyle(document.documentElement).getPropertyValue(
    "--arc-palette-title",
  );
  if (isArc) {
    return { browser: Browser.ARC, userAgent: navigator.userAgent };
  }

  // Chrome 1 - 71
  const isChrome =
    // @ts-ignore
    (!!window.chrome &&
      // @ts-ignore
      (!!window.chrome.webstore || !!window.chrome.runtime)) ||
    (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor));
  if (isChrome) {
    return { browser: Browser.CHROME, userAgent: navigator.userAgent };
  }

  // Blink engine detection
  const isBlink = (isChrome || isOpera) && !!window.CSS;
  if (isBlink) {
    return { browser: Browser.BLINK, userAgent: navigator.userAgent };
  }

  return { browser: "Unknown" as any, userAgent: navigator.userAgent };
};
