<script>
	export let data;
	let pageTitle = `Accueil - ${data.appName}`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={data.appDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={data.appDescription} />
</svelte:head>

<h1>Bienvenue sur WeDev</h1>
<p>Votre plateforme de développement web collaborative.</p>