"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useProgressiveWebApp } from "@/hooks/usePWA";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import { api } from "@/api/react";
import * as React from "react";
import { A } from "@/components/ui/link";
import { Status, StatusIcon } from "@/components/Status";
import { useBrowser } from "@/hooks/useBrowser";
import { usePlatform } from "@/hooks/usePlatform";

export default function PwaDemoPage() {
  const sw = useServiceWorker();
  const notifs = useNotifications();

  return (
    <div>
      <div className={"mb-4 px-2"}>
        <h1 className={"mb-2 mt-4 text-3xl"}>PWA testing grounds</h1>
        <h2 className={"mb-2 mt-12 text-xl"}>Notifications</h2>
        <p className={"mt-6"}>
          Notifications in the browser can be sent with 2.5 different methods
        </p>
        <ol className="pl-4 py-2 list-decimal">
          <li>
            <A
              href={
                "https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification"
              }
            >
              new Notification()
            </A>
          </li>
          <li>
            <A
              href={
                "https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification"
              }
            >
              serviceworker.showNotification()
            </A>
          </li>
          <li>
            Using{" "}
            <A
              href={
                "https://developer.mozilla.org/en-US/docs/Web/API/PushManager"
              }
            >
              PushManager API
            </A>{" "}
            to send a message from backend to a service worker that itself calls
            showNotification (method 2)
          </li>
        </ol>

        <p className={"mt-10"}>
          There are some immediate clarifications though:
        </p>
        <ul className="pl-4 py-2 list-disc">
          <li>On mobile phones, the app must be installed as a PWA</li>
          <li>
            YES, 3rd method will display notifications on mobile phones,
            including iOS, <strong>even though the app is closed</strong>
          </li>
          <li>
            NO, iOS does <strong>not support 1st method</strong>{" "}
            <sup>
              unlike what{" "}
              <A
                href={
                  "https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#browser_compatibility"
                }
              >
                MDN says
              </A>
            </sup>
          </li>
          <li>
            Desktop browsers does <strong>not support 3rd method</strong>
          </li>
          <li>
            iOS does not support the full showNotifications API. Note that icon
            is selected from web manifest (rather than specified in
            notification).
          </li>
        </ul>

        <p>
          In the same breath, it may be worth mentioning that for a web app to
          be installable as PWA, it must
        </p>
        <ul className="pl-4 py-2 list-disc text-sm">
          <li>
            Have a{" "}
            <A href={"https://developer.mozilla.org/en-US/docs/Web/Manifest"}>
              web manifest
            </A>
          </li>
          <li>
            Be served over HTTPS. When doing local development, consider
            therefore <A href={"https://ngrok.com/"}>ngrok</A>,{" "}
            <A href={"https://tunnelin.com/"}>tunnelin</A>,{" "}
            <A href={"https://pinggy.io/"}>pinggy.io</A>, or{" "}
            <A href={"https://loophole.cloud/"}>loophole.cloud</A>
          </li>
        </ul>
      </div>
      <h2 className={"mb-2 mt-12 text-xl max-w-full"}>
        Testing grounds: Notifications
      </h2>
      <div className={"flex gap-10 flex-col md:flex-row"}>
        <div className={"flex-1 overflow-x-scroll"}>
          <h3 className={"mb-2 mt-4 text-lg"}>Prerequisites</h3>
          <Prerequisites sw={sw} notifs={notifs} />
          <h3 className={"mb-2 mt-10 text-lg"}>Testing</h3>
          <NotificationTesting sw={sw} notifs={notifs} />
        </div>
        <div className={"flex-1 overflow-x-scroll"}>
          <h3 className={"mb-2 mt-4 text-lg"}>Data / settings</h3>
          <DeviceInformation sw={sw} notifs={notifs} />
        </div>
      </div>
      <div className={"text-center mt-20 text-sm"}>
        <A href={"https://github.com/tomfa/next-pwa-notifications"}>
          tomfa@github
        </A>
      </div>
    </div>
  );
}

const NotificationTesting = ({
  sw,
  notifs,
}: {
  notifs: ReturnType<typeof useNotifications>;
  sw: ReturnType<typeof useServiceWorker>;
}) => {
  const { toast } = useToast();
  const platform = usePlatform();
  const pwa = useProgressiveWebApp();
  const browser = useBrowser();

  const push = api.push.useMutation({
    onSuccess: () => {
      toast({
        description:
          "Push notification sent. It'll pop up soon (timing not exact)",
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to send push notification",
        description: err.message,
        variant: "destructive",
      });
    },
  });
  const sendTestNotification = async () => {
    if (!notifs.isSupported) {
      toast({
        description: "Notifications are not supported on your device",
        variant: "destructive",
      });
      return;
    }
    if (!notifs.hasPermission) {
      const { error } = await notifs.requestNotificationPermission();
      if (error) {
        toast({
          description: error,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await notifs.sendMessage("Test notification", "from new Notification()");
    } catch (err) {
      toast({
        title: "Failed at sending notifcation",
        description: String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className={"flex flex-col items-start gap-1"}>
      <p className={"mb-2 bg-gray-50 text-black px-6 py-4 rounded"}>
        Can&apos;t see any notifications? It can be that you&apos;re in &quot;Do
        not disturb&quot; mode on your{" "}
        {platform.isMobile ? "mobile" : "desktop"}, or have disabled
        notifications from {pwa.isInstalled ? "the app" : browser.browser} in{" "}
        {platform.platform} settings.
      </p>
      <span className="text-xs mt-4">Method 1</span>
      <Button
        variant={!notifs.hasPermission ? "outline" : "green"}
        disabled={!notifs.hasPermission}
        onClick={sendTestNotification}
      >
        new Notification()
      </Button>
      {platform.platform === "iOS" && (
        <span className="text-xs text-red-500">Not supported on iOS</span>
      )}
      <span className="text-xs mt-4">Method 2</span>
      <Button
        variant={!sw.isInstalled || !notifs.hasPermission ? "outline" : "green"}
        disabled={!sw.isInstalled || !notifs.hasPermission}
        onClick={() => {
          sw.showNotification(
            "Test event",
            "serviceWorker.showNotification test",
          ).catch((err) => {
            toast({
              title: "Failed to send event",
              description: String(err),
              variant: "destructive",
            });
          });
        }}
      >
        ServiceWorker.sendNotification()
      </Button>

      <span className="text-xs mt-4">Method 3</span>
      <Button
        variant={
          !sw.hasPushPermission || !platform.isMobile || !notifs.hasPermission
            ? "outline"
            : "green"
        }
        disabled={!sw.hasPushPermission || !notifs.hasPermission}
        onClick={() => {
          if (!sw.pushPermission) {
            return;
          }
          push.mutate({
            title: "Test push notification",
            description: "This is a test push notification",
            // @ts-expect-error
            permission: sw.pushPermission,
          });
        }}
      >
        Push API ➡️ ServiceWorker.showNotification()
      </Button>
      {!platform.isMobile && (
        <span className="text-xs text-red-500">Only supported on Mobile</span>
      )}
    </div>
  );
};

const DeviceInformation = ({
  sw,
  notifs,
}: {
  notifs: ReturnType<typeof useNotifications>;
  sw: ReturnType<typeof useServiceWorker>;
}) => {
  const browser = useBrowser();
  const device = usePlatform();
  return (
    <>
      <h4 className={"mb-2 mt-4 text-md"}>Browser</h4>
      {browser && (
        <code
          className={
            "block bg-gray-900 p-2 text-xs text-amber-200 border-gray-600 border"
          }
        >
          <pre className={"max-w-full overflow-x-scroll"}>
            {JSON.stringify(browser, null, 2)}
          </pre>
        </code>
      )}
      <h4 className={"mb-2 mt-4 text-md"}>Device</h4>
      {browser && (
        <code
          className={
            "block bg-gray-900 p-2 text-xs text-amber-200 border-gray-600 border"
          }
        >
          <pre className={"max-w-full overflow-x-scroll"}>
            {JSON.stringify(device, null, 2)}
          </pre>
        </code>
      )}
      <h4 className={"mb-2 mt-4 text-md"}>Notification permission</h4>
      {notifs.permission && (
        <code
          className={
            "block bg-gray-900 p-2 text-xs text-amber-200 border-gray-600 border"
          }
        >
          <pre className={"max-w-full overflow-x-scroll"}>
            {JSON.stringify(notifs.permission, null, 2)}
          </pre>
        </code>
      )}
      <h4 className={"mb-2 mt-4 text-md"}>Push API permission</h4>
      <code
        className={
          "block bg-gray-900 p-2 text-xs text-amber-200 border-gray-600 border"
        }
      >
        <pre className={"max-w-full overflow-x-scroll"}>
          {JSON.stringify(sw.pushPermission || null, null, 2)}
        </pre>
      </code>
      <h4 className={"mb-2 mt-4 text-md"}>Serviceworker</h4>
      <code
        className={
          "block bg-gray-900 p-2 text-xs text-amber-200 border-gray-600 border"
        }
      >
        <pre className={"max-w-full overflow-x-scroll"}>
          {JSON.stringify(sw.data || null, null, 2)}
        </pre>
      </code>
    </>
  );
};

const Prerequisites = ({
  sw,
  notifs,
}: {
  notifs: ReturnType<typeof useNotifications>;
  sw: ReturnType<typeof useServiceWorker>;
}) => {
  const { toast } = useToast();
  const [pusherError, setPusherError] = useState<string | undefined>();
  const pwa = useProgressiveWebApp();

  const requestPusherInfo = async () => {
    if (sw.pushPermission) {
      return;
    }
    if (!sw.isSupported) {
      toast({
        description: "Service workers are not supported on your device",
        variant: "destructive",
      });
      return;
    }
    const { error } = await sw.register();
    if (error) {
      toast({
        description: error,
        variant: "destructive",
      });
      return;
    }

    try {
      await sw.requestPushPermission();
    } catch (err) {
      setPusherError(String(err));
    }
  };

  return (
    <div className={"flex flex-col items-start gap-1"}>
      <Status
        status={pwa.isHttps}
        label={"Served over HTTPS"}
        helpText={"PWA Requirement (mobile)"}
      />
      <Status
        status={pwa.isInstallAllowed}
        label={"PWA Install supported"}
        helpText={"Mobile requirement"}
      />
      <Status
        status={pwa.isInstalled}
        label={"Installed as PWA"}
        helpText={
          <div className={"flex flex-col gap-0.5"}>
            <span className={"text-xs text-gray-400"}>Mobile requirement</span>
            <A className={"text-xs mb-2"} href={"/install"}>
              See installation instructions
            </A>
          </div>
        }
      />

      <Status status={notifs.isSupported} label={"Notifications supported"} />
      <Status
        status={notifs.hasPermission}
        label={"Notifications permissions"}
      />
      {notifs.isSupported && !notifs.hasPermission && (
        <Button onClick={notifs.requestNotificationPermission}>
          Request notification permission
        </Button>
      )}
      <Status status={sw.isSupported} label={"Service worker supported"} />
      <Status status={sw.isInstalled} label={"Service worker installed"} />
      {sw.isSupported && !sw.isInstalled && (
        <Button onClick={sw.register}>Install service worker</Button>
      )}
      <Status
        status={sw.hasPushPermission}
        label={"Push API access permissions"}
        helpText={"Mobile requirement"}
      />
      {sw.isInstalled && !sw.hasPushPermission && (
        <Button onClick={requestPusherInfo}>Request pusher access</Button>
      )}
      {pusherError && (
        <code
          className={
            "block bg-white p-2 text-xs text-amber-200 border-gray-600 border"
          }
        >
          <pre className={"max-w-full overflow-x-scroll"}>
            {JSON.stringify(pusherError, null, 2)}
          </pre>
        </code>
      )}
    </div>
  );
};
