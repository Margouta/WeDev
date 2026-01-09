<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content={data?.appDescription} />
	<meta name="theme-color" content="#206bc4" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={data?.appUrl} />
	<meta property="og:site_name" content={data?.appName} />
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="apple-touch-icon" href="/favicon.ico" />
</svelte:head>

{@render children()}
