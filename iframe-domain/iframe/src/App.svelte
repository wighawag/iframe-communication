<script lang="ts">
  import { onMount } from "svelte";
  import { persisted } from "svelte-persisted-store";

  const data = persisted("data", "none", {
    syncTabs: true,
  });

  let message: string = $state("hello-from-iframe");
  let hasAccess:
    | "loading"
    | "denied"
    | "granted"
    | "prompt"
    | "unknown"
    | "error-not-supported"
    | "error-granted-error"
    | "error-all-fails" = $state("loading");

  async function handleStorageAccess(): Promise<
    | "denied"
    | "granted"
    | "prompt"
    | "unknown"
    | "error-not-supported"
    | "error-granted-error"
    | "error-all-fails"
  > {
    // Check if Storage Access API is supported
    if (!document.requestStorageAccess) {
      // Storage Access API is not supported so best we can do is
      // hope it's an older browser that doesn't block 3P cookies.
      return "granted";
    }

    // Check if access has already been granted
    if (await document.hasStorageAccess()) {
      return "granted";
    }

    // Check the storage-access permission
    // Wrap this in a try/catch for browsers that support the
    // Storage Access API but not this permission check
    // (e.g. Safari and earlier versions of Firefox).
    let permission;
    try {
      permission = await navigator.permissions.query({
        name: "storage-access",
      });
    } catch (err) {
      console.error(err);
      // storage-access permission not supported. Assume no cookie access.
      return "error-not-supported";
    }

    if (permission) {
      if (permission.state === "granted") {
        // Permission has previously been granted so can just call
        // requestStorageAccess() without a user interaction and
        // it will resolve automatically.
        try {
          await document.requestStorageAccess();
          return "granted";
        } catch (error) {
          // This shouldn't really fail if access is granted, but return false
          // if it does.
          return "error-granted-error";
        }
      } else if (permission.state === "prompt") {
        // Need to call requestStorageAccess() after a user interaction
        // (potentially with a prompt). Can't do anything further here,
        // so handle this in the click handler.
        return "prompt";
      } else if (permission.state === "denied") {
        // Not used: see https://github.com/privacycg/storage-access/issues/149
        return "denied";
      }
    }

    // By default return false, though should really be caught by earlier tests.
    return "error-all-fails";
  }

  let serviceWorker: ServiceWorker | null = $state(null);
  const registerServiceWorker = async () => {
    navigator.serviceWorker.addEventListener("message", (message) => {
      console.log(message.data);
      if (message.data.type == "pong") {
        console.log("pong from service worker message event");
      }
    });

    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          {
            scope: "/",
          }
        );
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
          serviceWorker = registration.active;
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }
    }
  };

  onMount(() => {
    window.addEventListener("message", (message: MessageEvent) => {
      console.log(message.data);
      if (message.data.type === "save") {
        console.log("save");
        data.set(message.data.data);
      } else if (message.data.type == "pong") {
        console.log("pong");
      }
    });

    handleStorageAccess().then((access) => {
      hasAccess = access;
    });

    registerServiceWorker();
  });

  async function requestAccess() {
    (document as any)
      .requestStorageAccess({
        localStorage: true,
      })
      .then(
        (handle: any) => {
          console.log({ handle });
          hasAccess = "granted";
        },
        () => {
          hasAccess = "denied";
        }
      );
  }

  const broadcast = new BroadcastChannel("channel-123");

  broadcast.onmessage = (event) => {
    if (event.data && event.data.type === "pong") {
      console.log(`pong received`);
    }
  };

  function pingViaPostMessage() {
    // serviceWorker?.postMessage({ type: "ping" });
    if (navigator.serviceWorker.controller) {
      console.log(`pinging...`);
      navigator.serviceWorker.controller.postMessage({ type: "ping" });
    } else {
      console.log(`no controller...`);
    }
  }

  function pingViaBroadcastChannel() {
    broadcast.postMessage({ type: "ping" });
  }

  const messageChannel = new MessageChannel();
  messageChannel.port1.onmessage = (event) => {
    if (event.data.type === "pong") {
      console.log("pong received via channel");
    }
  };
  let init = false;
  function pingViaChannel() {
    if (navigator.serviceWorker.controller) {
      console.log(`pinging via channmel...`);
      if (!init) {
        init = true;
        navigator.serviceWorker.controller.postMessage({ type: "init" }, [
          messageChannel.port2,
        ]);
      }
      messageChannel.port1.postMessage({ type: "ping" });
    } else {
      console.log(`no controller...`);
    }
  }
</script>

<div>
  {#if hasAccess === "prompt"}
    <button onclick={requestAccess}>requestAccess</button>
  {:else if hasAccess !== "granted"}
    {hasAccess}
    <br />
    <button onclick={requestAccess}>requestAccess anyway</button>
  {/if}
  <hr />
  {$data}
  <hr />

  <input type="text" bind:value={message} />
  <button onclick={() => data.set(message)}>set</button>
  <hr />
  <button onclick={pingViaPostMessage}>ping (postMessage)</button>
  <button onclick={pingViaBroadcastChannel}>ping (broadcast)</button>
  <button onclick={pingViaChannel}>ping (channel)</button>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
