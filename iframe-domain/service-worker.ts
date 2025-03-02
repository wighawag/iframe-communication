/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const ID = "1";

const sw = self as unknown as ServiceWorkerGlobalScope;

const broadcast = new BroadcastChannel("channel-123");

broadcast.onmessage = (event) => {
  if (event.data && event.data.type === "ping") {
    broadcast.postMessage({ type: "pong" });
  }
};

let communicationPort;
sw.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data.type === "ping") {
    // event.source?.postMessage({ type: "pong" });
    sw.clients.matchAll().then(function (clients) {
      for (const client of clients) {
        //Respond to last focused tab
        client.postMessage({ type: "pong" });
      }
    });

    communicationPort.postMessage({ type: "pong" });
  } else if (event.data && event.data.type === "init") {
    communicationPort = event.ports[0];
  }
});

sw.addEventListener("install", (event) => {
  console.log("Install");
});

sw.addEventListener("activate", (event) => {
  console.log("Activate");
  event.waitUntil(sw.clients.claim());
});
