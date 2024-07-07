import { useCallback, useEffect, useState } from "react";

export const Browser = {
  OPERA: "Opera",
  FIREFOX: "Firefox",
  SAFARI: "Safari",
  IE: "Internet Explorer",
  EDGE: "Edge",
  CHROME: "Chrome",
  BLINK: "Blink",
} as const;

export type Browser = (typeof Browser)[keyof typeof Browser];

export const useBrowser = () => {
  const [browser, setBrowser] = useState<Browser | null>(null);

  const redetectBrowser = useCallback(() => {
    if (browser !== null) {
      return;
    }
    const currentValue = getBrowser();
    if (currentValue) {
      setBrowser(currentValue);
    }
    return currentValue;
  }, [browser]);

  useEffect(() => {
    if (browser) {
      return;
    }
    const foundBrowser = redetectBrowser();
    if (!foundBrowser) {
      const timeout = setTimeout(redetectBrowser, 500);
      return () => clearTimeout(timeout);
    }
    setBrowser(foundBrowser);
  }, [browser, redetectBrowser]);

  return browser;
};
const getBrowser = (): Browser | null => {
  if (typeof window === "undefined") {
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
    return Browser.OPERA;
  }

  // Firefox 1.0+
  // @ts-ignore
  const isFirefox = typeof InstallTrigger !== "undefined";
  if (isFirefox) {
    return Browser.FIREFOX;
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
    return Browser.SAFARI;
  }

  // Internet Explorer 6-11
  // @ts-ignore
  const isIE = /*@cc_on!@*/ false || !!document.documentMode;
  if (isIE) {
    return Browser.IE;
  }

  // Edge 20+
  // @ts-ignore
  const isEdge = !isIE && !!window.StyleMedia;
  if (isEdge) {
    return Browser.EDGE;
  }

  // Chrome 1 - 71
  const isChrome =
    // @ts-ignore
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  if (isChrome) {
    return Browser.CHROME;
  }

  // Blink engine detection
  const isBlink = (isChrome || isOpera) && !!window.CSS;
  if (isBlink) {
    return Browser.BLINK;
  }

  return null;
};
