"use client";

import { Intro } from "@/components/Intro";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useProgressiveWebApp } from "@/hooks/usePWA";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import { api } from "@/api/react";
import * as React from "react";
import Link from "next/link";
import {A} from "@/components/ui/link";

export default function PwaDemoPage() {
  const { toast } = useToast();
  const [pusherError, setPusherError] = useState<string | undefined>();
  const pwa = useProgressiveWebApp();
  const sw = useServiceWorker();
  const notifs = useNotifications();
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
      await notifs.sendMessage(
        "Test notification",
        "This is a test notification",
      );
    } catch (err) {
      toast({
        title: "Failed at sending notifcation",
        description: String(err),
        variant: "destructive",
      });
    }
  };

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
    <div>
      <div className={"mb-4 px-2"}>
        <h1 className={"mb-2 mt-4 text-3xl"}>PWA testing grounds</h1>
        <h2 className={"mb-2 mt-4 text-xl"}>Notifications</h2>
        <p>Notifications in the browser can be sent with 2.5 different methods</p>
        <ol className="pl-4 py-2 list-decimal text-sm">
          <li><A href={"https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification"}>new Notification()</A></li>
          <li><A href={"https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification"}>serviceworker.showNotification()</A></li>
          <li>Using <A href={'https://developer.mozilla.org/en-US/docs/Web/API/PushManager'}>PushManager API</A> to send a message from backend to a service worker that itself calls showNotification (method 2)</li>
        </ol>

        <p>There are some immediate clarifications though:</p>
        <ul className="pl-4 py-2 list-disc text-sm">
          <li>On mobile phones, the app must be installed as a PWA</li>
          <li>YES, 3rd method will display notifications on mobile phones, including iOS, <strong>even though the app is closed</strong></li>
          <li>NO, iOS does <strong>not support 1st method</strong> <sup>unlike what <A href={'https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#browser_compatibility'}>MDN says</A></sup></li>
          <li>Desktop browsers does <strong>not support 3rd method</strong></li>
          <li>iOS does not support the full showNotifications API. Note that icon is selected from web manifest (rather than specified in notification).</li>
        </ul>

        <p>In the same breath, it may be worth mentioning that for a web app to be installable as PWA, it must</p>
        <ul className="pl-4 py-2 list-disc text-sm">
          <li>Have a <A href={'https://developer.mozilla.org/en-US/docs/Web/Manifest'}>web manifest</A></li>
          <li>Be served over HTTPS. When doing local development, consider therefore <A href={'https://ngrok.com/'}>ngrok</A>, <A href={'https://ngrok.com/'}>ngrok</A>,<A href={'https://tunnelin.com/'}>tunnelin</A>,<A href={'https://pinggy.io/'}>pinggy.io</A>, or <A href={'https://loophole.cloud/'}>loophole.cloud</A></li>
        </ul>
      </div>
      <h2 className={"mb-2 mt-4 text-xl"}>Testing grounds: Notifications</h2>
      <div className={"flex flex-col items-start gap-1"}>
        <Button
          variant={pwa.isInstalled ? "green" : "default"}
          disabled={!pwa.isInstallAllowed || pwa.isInstalled}
          onClick={pwa.prompt}
        >
          Add to Home screen: {pwa.isInstalled ? "Installed" : "install"}
        </Button>
        <Button
          variant={sw.isInstalled ? "green" : "default"}
          disabled={!sw.isSupported}
          onClick={sw.isInstalled ? sw.unRegister : sw.register}
        >
          Service worker: {sw.isInstalled ? "Installed" : "install"}
        </Button>
        <Button
          variant={sw.isInstalled ? "destructive" : "default"}
          disabled={!sw.isInstalled}
          onClick={() => {
            sw.sendEvent("Test event", "This is a test event").catch((err) => {
              toast({
                title: "Failed to send event",
                description: String(err),
                variant: "destructive",
              });
            });
          }}
        >
          Send message to service worker
        </Button>
        <Button
          variant={notifs.hasPermission ? "green" : "default"}
          disabled={!notifs.isSupported}
          onClick={notifs.requestNotificationPermission}
        >
          Notifications: {notifs.hasPermission ? "Allowed" : "Request access"}
        </Button>

        <Button
          variant={notifs.hasPermission ? "destructive" : "default"}
          onClick={sendTestNotification}
        >
          Test notification
        </Button>
        <Button
          variant={sw.hasPushPermission ? "green" : "default"}
          onClick={requestPusherInfo}
        >
          Request pusher info
        </Button>
        <Button
          variant={sw.hasPushPermission ? "destructive" : "default"}
          disabled={!sw.hasPushPermission}
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
          Send notification via Push api
        </Button>
        {(sw.pushPermission && (
            <div>
              <h2 className={"my-2"}>PushManager permission</h2>
              <code className={"block bg-white p-2 text-xs text-red-800"}>
              <pre className={"max-w-full overflow-x-scroll"}>
                {JSON.stringify(sw.pushPermission, null, 2)}
              </pre>
              </code>
            </div>
          )) ||
          (pusherError && (
            <div>
              <h2 className={"my-2"}>PushManager permission error</h2>
              <code className={"block bg-white p-2 text-xs text-red-800"}>
                <pre className={"max-w-full overflow-x-scroll"}>
                  {JSON.stringify(pusherError, null, 2)}
                </pre>
              </code>
            </div>
          ))}
      </div>
    </div>
  );
}
