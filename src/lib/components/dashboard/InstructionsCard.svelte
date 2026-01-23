<script>
	/**
	 * Carte d'instructions et acceptation des CGU
	 * @component
	 */
	import { createEventDispatcher } from 'svelte';

	export let cgu = 0;
	export let isUpdating = false;

	const dispatch = createEventDispatcher();

	/**
	 * Gère l'acceptation des CGU
	 */
	function handleAccept() {
		if (cgu === 1 || isUpdating) return;
		dispatch('accept');
	}
</script>

<div class="card">
	<div class="card-body">
		<div class="ribbon ribbon-top bg-danger">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="icon icon-tabler icons-tabler-filled icon-tabler-alert-triangle"
				><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
					d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z"
				/></svg
			>
		</div>
		<div class="subheader">Instructions à lire</div>
		<div class="d-flex align-items-baseline mb-2">
			<div class="h1 mb-0 me-2">
				{cgu === 1 ? 'Accepté' : 'Non accepté'}
			</div>
		</div>
		<div class="text-secondary mt-2">
			Tout ce qu'il faut savoir dans ce challenge est récapitulé ici :
		</div>
		<div class="text-center">
			<a
				class="btn btn-sm mt-2"
				href="https://aywencorp.notion.site/Instructions-lire-pour-les-ditions-devs-codent-1a8d9ee74c118090a361c718340cb75b"
				target="_blank"
				rel="noopener noreferrer"
				><svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="icon icon-tabler icons-tabler-outline icon-tabler-brand-notion"
					><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
						d="M11 17.5v-6.5h.5l4 6h.5v-6.5"
					/><path
						d="M19.077 20.071l-11.53 .887a1 1 0 0 1 -.876 -.397l-2.471 -3.294a1 1 0 0 1 -.2 -.6v-10.741a1 1 0 0 1 .923 -.997l11.389 -.876a2 2 0 0 1 1.262 .33l1.535 1.023a2 2 0 0 1 .891 1.664v12.004a1 1 0 0 1 -.923 .997"
					/><path d="M4.5 5.5l2.5 2.5" /><path d="M20 7l-13 1v12.5" /></svg
				>Lire le Notion
			</a>
		</div>
		<label class="form-check mt-2">
			<input
				class="form-check-input"
				type="checkbox"
				on:click|preventDefault={handleAccept}
				checked={cgu === 1}
				disabled={cgu === 1 || isUpdating}
			/>
			<span class="form-check-label"
				>J'accepte que ma contribution soit publiée sous licence GPL v3.</span
			>
		</label>
	</div>
</div>
