<script lang="ts">
  import { onMount } from "svelte";
  import { persisted } from "svelte-persisted-store";

  const data = persisted("data", "none", {
    syncTabs: true,
  });

  let message: string = $state("");
  let hasAccess: "loading" | "denied" | "granted" | "prompt" =
    $state("loading");
  onMount(() => {
    window.addEventListener("message", (message: MessageEvent) => {
      console.log(message.data);
      if (message.data.type === "save") {
        console.log("save");
        data.set(message.data.data);
      }
    });

    navigator.permissions.query({ name: "storage-access" }).then((result) => {
      hasAccess = result.state;
    });
  });

  function requestAccess() {
    document.requestStorageAccess().then(
      (handle) => {
        hasAccess = "granted";
      },
      () => {
        hasAccess = "denied";
      }
    );
  }
</script>

{#if hasAccess === "prompt"}
  <button>requestAccess</button>
{:else if hasAccess !== "granted"}
  {hasAccess}
{/if}
<hr />
{$data}
<hr />

<input type="text" bind:value={message} defaultValue="hello-from-iframe" />
<button onclick={() => data.set(message)}>set</button>
