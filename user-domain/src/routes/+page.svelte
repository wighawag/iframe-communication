<script lang="ts">
	import { onMount } from 'svelte';
	const iframeURL = new URL(`http://localhost:8881/iframe/`);
	const iframeOrigin = `${iframeURL.protocol}//${iframeURL.host}`;

	let iframe: HTMLIFrameElement;

	let message: string;

	onMount(() => {
		window.addEventListener('message', (event) => {
			console.log(event.data);
		});
	});

	function save(msg: string) {
		if (!iframe.contentWindow) {
			console.error(`no iframe window`);
			return;
		}
		iframe.contentWindow.postMessage({ type: 'save', data: msg }, iframeOrigin);
	}
</script>

<input type="text" bind:value={message} defaultValue="hello-from-user" />
<button onclick={() => save(message)}>set</button>
<hr />
<iframe bind:this={iframe} title="iframe" src={iframeURL.toString()}></iframe>
