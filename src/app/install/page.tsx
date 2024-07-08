"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Platform, usePlatform } from "@/hooks/usePlatform";
import { Browser, useBrowser } from "@/hooks/useBrowser";
import { useProgressiveWebApp } from "@/hooks/usePWA";
import Link from "next/link";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { A } from "@/components/ui/link";

export default function DocsDownloadAsAppPage() {
  const platform = usePlatform();
  const { isInstalled } = useProgressiveWebApp();

  const [tab, setTab] = useState(platform.platform);

  useEffect(() => {
    if (!platform || tab) {
      return;
    }
    setTab(platform.platform);
  }, [platform, tab]);

  return (
    <div className={"min-h-screen"}>
      <A href={"/"}>Back</A>
      <div className={"mb-4 px-2"}>
        <h1 className={"mb-2 mt-4 text-xl"}>Download as App</h1>
        <p className={"mb-0 text-sm"}>Select your platform below.</p>
      </div>
      {isInstalled && (
        <Alert variant={"destructive"} className={"mb-8"}>
          <AlertTitle>Already installed</AlertTitle>
          <AlertDescription className={"flex flex-col"}>
            <span>
              It seems you are browsing this page from within the app.
            </span>
            <span>
              Installation instructions below are likely not necessary.
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue={tab || Platform.IOS}
        value={tab}
        className="mb-4 w-[400px] max-w-full"
        onValueChange={(val) => setTab(val as Platform)}
      >
        <TabsList>
          <TabsTrigger value={Platform.ANDROID}>Android</TabsTrigger>
          <TabsTrigger value={Platform.IOS}>iOS</TabsTrigger>
          <TabsTrigger value={Platform.MAC}>Mac OS</TabsTrigger>
          <TabsTrigger value={Platform.WINDOWS}>Windows</TabsTrigger>
          <TabsTrigger value={Platform.LINUX}>Linux</TabsTrigger>
        </TabsList>
        <TabsContent value={Platform.ANDROID}>
          <DownloadTab platform={Platform.ANDROID} />
        </TabsContent>
        <TabsContent value={Platform.IOS}>
          <DownloadTab platform={Platform.IOS} />
        </TabsContent>
        <TabsContent value={Platform.WINDOWS}>
          <DownloadTab platform={Platform.WINDOWS} />
        </TabsContent>
        <TabsContent value={Platform.MAC}>
          <DownloadTab platform={Platform.MAC} />
        </TabsContent>
        <TabsContent value={Platform.LINUX}>
          <DownloadTab platform={Platform.LINUX} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const AndroidDownloadTab = () => {
  const { prompt } = useProgressiveWebApp();
  return (
    <div>
      <ContentHeader>Instructions for Android</ContentHeader>
      <ul className={"list-decimal px-6"}>
        <li>Click the button below</li>
        <li>
          Click <ReferenceText>Install</ReferenceText>
        </li>
      </ul>
      <Button className={"my-4 w-full"} variant={"green"} onClick={prompt}>
        Add to Home Screen
      </Button>
    </div>
  );
};

const IosDownloadTab = () => {
  const browser = useBrowser();

  return (
    <div>
      <ContentHeader>Instructions for iOS</ContentHeader>
      <ul className={"list-decimal px-6"}>
        <li>
          <div className={"mb-10 flex flex-col gap-2"}>
            <span>Click the share icon in your browser</span>

            {browser === Browser.SAFARI ? (
              <Image
                src={"/img/pwa/iphone-safari-share.png"}
                alt={"Install button in Safari"}
                width={375}
                height={667}
                className={"w-full"}
              />
            ) : (
              <Image
                src={"/img/pwa/iphone-chrome-share.png"}
                alt={"Install button in Chrome"}
                width={375}
                height={667}
                className={"w-full"}
              />
            )}
          </div>
        </li>
        <li>
          <div className={"mb-10 flex flex-col gap-2"}>
            <span>
              Confirm the website details and tap{" "}
              <ReferenceText className={"inline-block"}>
                Add to Home Screen
              </ReferenceText>
            </span>

            <Image
              src={"/img/pwa/iphone-add-homescreen.png"}
              alt={"Add to Home Screen button on iPhone"}
              width={375}
              height={667}
              className={"w-full"}
            />
          </div>
        </li>
        <li>
          Click <ReferenceText>Add</ReferenceText> to finish.
        </li>
      </ul>
    </div>
  );
};

const ContentHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className={"mb-2 mt-4"}>{children}</h2>
);

const DownloadTab = ({ platform }: { platform: Platform }) => {
  if (platform === Platform.IOS) {
    return <IosDownloadTab />;
  }

  if (platform === Platform.ANDROID) {
    return <AndroidDownloadTab />;
  }

  return (
    <div>
      <ContentHeader>Instructions for {platform}</ContentHeader>
      <ul className={"list-decimal px-6"}>
        <li>
          Open this web page in{" "}
          <Link href={"https://www.google.com/chrome/"}>Chrome</Link>
        </li>
        <li>
          <div className={"mb-2 flex flex-col gap-2"}>
            <span>Click icon at the top right of the address bar </span>

            <Image
              src={"/img/pwa/chrome-download.png"}
              alt={"Install button in Chrome"}
              width={824}
              height={78}
              className={"w-full"}
            />
          </div>
        </li>
        <li>Follow the onscreen instructions to install Dutytime.</li>
      </ul>
    </div>
  );
};

const ReferenceText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={cn("my-1 bg-white px-1 text-sm text-black", className)}>
    {children}
  </span>
);
