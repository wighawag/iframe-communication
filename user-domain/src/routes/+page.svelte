<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_IFRAME_URL } from '$env/static/public';
	const iframeURL = new URL(PUBLIC_IFRAME_URL);
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
