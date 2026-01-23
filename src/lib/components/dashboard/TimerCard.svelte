<script>
	/**
	 * Carte affichant le temps restant et le statut du passage
	 * @component
	 */
	export let tournage;
	export let passageStarted = false;
	export let passageEnded = false;
	export let timingInfo = null;

	/**
	 * Formate une date en format localisé
	 * @param {string} value - Date ISO
	 * @returns {string}
	 */
	function formatDateTime(value) {
		return value ? new Date(value).toLocaleString() : 'Non défini';
	}

	// Variables réactives pour plus de clarté
	$: isAbsent = tournage?.status === 'absent';
	$: ribbonColor = passageEnded ? 'bg-success' : passageStarted ? 'bg-primary' : 'bg-info';
	$: displayText = passageEnded 
		? 'Terminé' 
		: passageStarted 
			? timingInfo?.text || 'En cours'
			: timingInfo?.text || 'À venir';
	$: displayMessage = passageEnded
		? 'Passage terminé : vous serez tenu au courant de la sortie de la vidéo.'
		: passageStarted
			? 'Votre passage est en cours, n\'oubliez pas de rendre votre projet !'
			: tournage?.start_time
				? `Votre passage commence le ${formatDateTime(tournage.start_time)}`
				: 'Planning non défini pour ce tournage.';
</script>

<div class="card">
	<div class="card-body">
		{#if isAbsent}
			<!-- Statut Absent -->
			<div class="ribbon ribbon-top bg-danger">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-off"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8.18 8.189a4.01 4.01 0 0 0 2.616 2.627m3.507 -.545a4 4 0 1 0 -5.59 -5.552" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4c.412 0 .81 .062 1.183 .178m2.633 2.618c.12 .38 .184 .785 .184 1.204v2" /><path d="M3 3l18 18" /></svg>
			</div>
			<div class="subheader">Statut</div>
			<div class="d-flex align-items-baseline mb-2">
				<div class="h1 mb-0 text-danger">Absent</div>
			</div>
			<div class="text-secondary mt-2">
				Vous êtes marqué comme absent pour ce tournage. Vous ne pouvez pas soumettre de rendu.
			</div>
		{:else}
			<!-- Statut Normal -->
			<div class="ribbon ribbon-top {ribbonColor}">
				{#if passageEnded}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-clock"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a1 1 0 0 0 -.993 .883l-.007 .117v5l.009 .131a1 1 0 0 0 .197 .477l.087 .1l3 3l.094 .082a1 1 0 0 0 1.226 0l.094 -.083l.083 -.094a1 1 0 0 0 0 -1.226l-.083 -.094l-2.707 -2.708v-4.585l-.007 -.117a1 1 0 0 0 -.993 -.883z" /></svg>
				{/if}
			</div>
			<div class="subheader">Temps restant</div>
			<div class="d-flex align-items-baseline mb-2">
				<div class="h1 mb-0 me-2">
					{#if passageEnded}
						<span class="text-success">{displayText}</span>
					{:else}
						{displayText}
					{/if}
				</div>
			</div>
			<div class="text-secondary mt-2">
				{displayMessage}
			</div>
		{/if}
	</div>
</div>
