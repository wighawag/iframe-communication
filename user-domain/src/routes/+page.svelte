<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_IFRAME_URL } from '$env/static/public';
	const iframeURL = new URL(PUBLIC_IFRAME_URL);
	const iframeOrigin = `${iframeURL.protocol}//${iframeURL.host}`;
	let iframeSRC = $state(iframeURL.toString());

	let iframe: HTMLIFrameElement;
	let attributes: Record<string, string> = $state({});

	let message: string = $state('hello-from-user');

	onMount(() => {
		const currentURL = new URL(location.href);
		const searchParams = currentURL.searchParams;
		if (searchParams.has('_d_eruda')) {
			iframeSRC += '?_d_eruda';
		}
		console.log({ iframeSRC });
		attributes = Object.fromEntries(searchParams.entries());

		if (!attributes['sandbox']) {
			attributes['sandbox'] =
				'allow-scripts allow-same-origin allow-storage-access-by-user-activation';
		}
		delete attributes['_d_eruda'];
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

<div>
	<input type="text" bind:value={message} />
	<button onclick={() => save(message)}>set</button>
	<hr />
	<iframe {...attributes} bind:this={iframe} title="iframe" src={iframeSRC}></iframe>
</div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
	iframe {
		width: 100%;
		height: calc(100% - 50px);
	}
</style>
