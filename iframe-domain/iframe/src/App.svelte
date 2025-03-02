<script lang="ts">
  import { onMount } from "svelte";
  import { persisted } from "svelte-persisted-store";

  const data = persisted("data", "none", {
    syncTabs: true,
  });

  let message: string;

  onMount(() => {
    window.addEventListener("message", (message: MessageEvent) => {
      console.log(message.data);
      if (message.data.type === "save") {
        console.log("save");
        data.set(message.data.data);
      }
    });
  });
</script>

{$data}
<hr />

<input type="text" bind:value={message} defaultValue="hello-from-iframe" />
<button onclick={() => data.set(message)}>set</button>
