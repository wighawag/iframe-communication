<script lang="ts">
  import { onMount } from "svelte";
  import { persisted } from "svelte-persisted-store";

  const data = persisted("data", "none", {
    syncTabs: true,
  });

  let message: string = $state("hello-from-iframe");
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

{#if hasAccess === "prompt"}
  <button onclick={requestAccess}>requestAccess</button>
{:else if hasAccess !== "granted"}
  {hasAccess}
{/if}
<hr />
{$data}
<hr />

<div>
  <input type="text" bind:value={message} />
  <button onclick={() => data.set(message)}>set</button>
</div>

<style>
  div {
    background-color: black;
    color: white;
  }
</style>
