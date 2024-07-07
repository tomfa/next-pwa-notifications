/* eslint-disable  */

console.log("Service worker here 2");

/**
 * Service worker event handler
 * @param {MessageEvent<any>} event - The event object
 * @param {InstallEvent} event.data - The data sent to the worker.
 */
addEventListener("install", (event) => {
  console.log("Service worker installed");
});

/**
 * Service worker event handler
 * @param {MessageEvent<any>} event - The event object
 */
addEventListener("message", (event) => {
  console.log(`Message received: ${event.data}`);
});

/**
 * Service worker push handler
 * @param {PushEvent} event - The push event object
 */
addEventListener("push", (event) => {
  if (!("data" in event)) {
    console.error(`Push event data is missing`);
    return;
  }
  // @ts-ignore
  const json = event.data && event.data.json();
  console.log(`Push data type`, typeof json);
  console.log(`Push data`, json);
  const title = json?.title;
  const body = json?.body;
  // @ts-ignore
  event.waitUntil(registration.showNotification(title, { body }));
});
