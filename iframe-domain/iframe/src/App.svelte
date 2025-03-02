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
    | "error" = $state("loading");

  onMount(() => {
    window.addEventListener("message", (message: MessageEvent) => {
      console.log(message.data);
      if (message.data.type === "save") {
        console.log("save");
        data.set(message.data.data);
      }
    });

    if (navigator.permissions) {
      try {
        navigator.permissions
          .query({ name: "storage-access" })
          .then((result) => {
            hasAccess = result.state;
          });
      } catch (error) {
        hasAccess = "error";
      }
    } else {
      hasAccess = "unknown";
    }
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
</script>

<div>
  {#if hasAccess === "prompt"}
    <button onclick={requestAccess}>requestAccess</button>
  {:else if hasAccess !== "granted"}
    {hasAccess}
  {/if}
  <hr />
  {$data}
  <hr />

  <input type="text" bind:value={message} />
  <button onclick={() => data.set(message)}>set</button>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
