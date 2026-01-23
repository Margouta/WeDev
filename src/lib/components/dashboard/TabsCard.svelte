<script>
	/**
	 * Composant de navigation par onglets pour le dashboard
	 * @component
	 */
	import Uploader from '../../../components/uploader.svelte';

	export let selectedTournage;
	export let passageStarted = false;
	export let passageEnded = false;
	export let timingInfo = null;
	export let canDownloadPrevious = false;
	export let previousProject = null;
	export let uploadDisabled = false;

	let activeTab = 'brief';

	/**
	 * Formate une date en format localisé complet
	 * @param {string} value - Date ISO
	 * @returns {string}
	 */
	function formatDateTime(value) {
		return value ? new Date(value).toLocaleString() : 'Non défini';
	}
</script>

<div class="card">
	<div class="card-header">
		<ul class="nav nav-tabs card-header-tabs">
			<li class="nav-item">
				<button
					class="nav-link"
					class:active={activeTab === 'brief'}
					on:click={() => (activeTab = 'brief')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="icon me-2"
						><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
							d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"
						/><path
							d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"
						/><path d="M9 12l.01 0" /><path d="M13 12l2 0" /><path d="M9 16l.01 0" /><path
							d="M13 16l2 0"
						/></svg
					>
					Brief
				</button>
			</li>
			<li class="nav-item">
				<button
					class="nav-link"
					class:active={activeTab === 'passage'}
					on:click={() => (activeTab = 'passage')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="icon me-2"
						><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
							d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
						/><path d="M12 7v5l3 3" /></svg
					>
					Votre passage
				</button>
			</li>
			<li class="nav-item">
				<button
					class="nav-link"
					class:active={activeTab === 'rendu'}
					on:click={() => (activeTab = 'rendu')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="icon me-2"
						><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
							d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"
						/><path d="M7 9l5 -5l5 5" /><path d="M12 4v12" /></svg
					>
					Rendre le projet
				</button>
			</li>
			<li class="nav-item">
				<button
					class="nav-link"
					class:active={activeTab === 'recap'}
					on:click={() => (activeTab = 'recap')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="icon me-2"
						><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
							d="M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3"
						/><path d="M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3" /><path
							d="M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7"
						/><path d="M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1" /><path d="M17 12h.01" /><path
							d="M13 12h.01"
						/></svg
					>
					Récap de fin
				</button>
			</li>
			<li class="nav-item">
				<button
					class="nav-link"
					class:active={activeTab === 'faq'}
					on:click={() => (activeTab = 'faq')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="icon icon-tabler icons-tabler-outline icon-tabler-help me-2"
						><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
							d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"
						/><path d="M12 17l0 .01" /><path
							d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4"
						/></svg
					>
					FAQ
				</button>
			</li>
		</ul>
	</div>
	<div class="card-body" style="display: flex; flex-direction: column; flex: 1;">
		<div class="tab-content" style="display: flex; flex-direction: column; flex: 1; height: 100%;">
			<!-- Onglet Brief -->
			{#if activeTab === 'brief'}
				<div class="tab-pane active show">
					<div class="card-stamp">
						<div class="card-stamp-icon bg-primary">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="icon icon-tabler icons-tabler-filled icon-tabler-clipboard-text"
								><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
									d="M17.997 4.17a3 3 0 0 1 2.003 2.83v12a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 2.003 -2.83a4 4 0 0 0 3.997 3.83h4a4 4 0 0 0 3.98 -3.597zm-2.997 10.83h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m0 -4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m-1 -9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0 -4z"
								/></svg
							>
						</div>
					</div>
					{@html selectedTournage.brief}
				</div>
			{/if}

			<!-- Onglet Votre passage -->
			{#if activeTab === 'passage'}
				<div class="tab-pane active show">
					<div class="row">
						<div class="col-md-12 col-lg-6">
							<div class="card mb-3">
								<div class="card-header">
									<h3 class="card-title">Informations sur votre créneau</h3>
								</div>
								<div class="card-body">
									<div class="mb-3">
										<div class="subheader">Ordre de passage</div>
										<div class="h2">N°{selectedTournage.passage_number}</div>
									</div>
									<div class="mb-3">
										<div class="subheader">Période</div>
										<div class="text-secondary">
											Du {formatDateTime(selectedTournage.start_time)} au {formatDateTime(
												selectedTournage.end_time
											)}
										</div>
									</div>
									{#if timingInfo}
										<div class="alert alert-info mb-0">
											<div class="d-flex align-items-center">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-tabler icons-tabler-outline icon-tabler-clock me-2"
													><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
														d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
													/><path d="M12 7v5l3 3" /></svg
												>
												<strong>{timingInfo.text}</strong>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
						<div class="col-md-12 col-lg-6">
							<div class="card mb-3">
								<div class="card-header">
									<h3 class="card-title">Projet précédent</h3>
								</div>
								<div
									class="card-body d-flex flex-column justify-content-center align-items-center"
									style="min-height: 200px;"
								>
									{#if canDownloadPrevious}
										<div class="text-center">
											<p class="text-secondary mb-3">
												Cliquez sur le bouton ci-dessous pour télécharger le projet du passage
												précédent
											</p>
											<a
												href={previousProject}
												target="_blank"
												rel="noopener noreferrer"
												class="btn btn-primary btn-lg"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-tabler icons-tabler-outline icon-tabler-download me-2"
													><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
														d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"
													/><path d="M7 11l5 5l5 -5" /><path d="M12 3v12" /></svg
												>
												Télécharger le projet
											</a>
										</div>
									{:else if selectedTournage.passage_number === 1}
										<div class="text-center text-muted">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="48"
												height="48"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="icon icon-tabler icons-tabler-outline icon-tabler-trophy mb-3"
												><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
													d="M8 21l8 0"
												/><path d="M12 17l0 4" /><path d="M7 4l10 0" /><path
													d="M17 4v8a5 5 0 0 1 -10 0v-8"
												/><path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path
													d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
												/></svg
											>
											<p>Vous êtes le premier passage !</p>
											<p class="small">Il n'y a donc rien à télécharger.</p>
										</div>
									{:else if !passageStarted}
										<div class="text-center text-muted">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="48"
												height="48"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="icon icon-tabler icons-tabler-outline icon-tabler-lock mb-3"
												><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
													d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"
												/><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path
													d="M8 11v-4a4 4 0 1 1 8 0v4"
												/></svg
											>
											<p>Projet non disponible</p>
											<p class="small">Le projet sera disponible dès le début de votre créneau.</p>
										</div>
									{:else if passageEnded}
										<div class="text-center text-muted">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="48"
												height="48"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												class="icon icon-tabler icons-tabler-outline icon-tabler-clock-off mb-3"
												><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
													d="M5.633 5.64a9 9 0 1 0 12.735 12.72m1.674 -2.32a9 9 0 0 0 -12.082 -12.082"
												/><path d="M12 7v1" /><path d="M3 3l18 18" /></svg
											>
											<p>Créneau terminé</p>
											<p class="small">Votre temps de passage est écoulé.</p>
										</div>
									{:else}
										<div class="text-center text-muted">
											<p>Le projet précédent n'est pas disponible</p>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Onglet Rendre le projet -->
			{#if activeTab === 'rendu'}
				<div class="tab-pane active show" style="display: flex; flex-direction: column; flex: 1;">
					<Uploader tournage={selectedTournage} disabled={uploadDisabled} />
				</div>
			{/if}

			<!-- Onglet Récap de fin -->
			{#if activeTab === 'recap'}
				<div class="tab-pane active show">
					{#if selectedTournage.form}
						<div class="alert alert-important alert-warning mb-4">
							<div class="d-flex align-items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="icon icon-tabler icons-tabler-filled icon-tabler-alert-triangle me-2"
									><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
										d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z"
									/></svg
								>
								<div>
									<strong>Important !</strong> Remplissez ce formulaire de récapitulatif à la fin de votre
									passage.
								</div>
							</div>
						</div>
						<div class="card">
							<div class="card-body rounded" style="min-height: 600px;">
								<!-- svelte-ignore a11y_missing_attribute -->
								<iframe
									data-tally-src="https://tally.so/embed/{selectedTournage.form}?alignLeft=1&hideTitle=0&transparentBackground=0&dynamicHeight=1"
									loading="lazy"
									width="100%"
									height="100%"
									frameborder="0"
									marginheight="0"
									marginwidth="0"
									title="Formulaire de récapitulatif"
									class="rounded"
									style="min-height: 600px;"
								></iframe>
								<script>
									var d = document,
										w = 'https://tally.so/widgets/embed.js',
										v = function () {
											'undefined' != typeof Tally
												? Tally.loadEmbeds()
												: d
														.querySelectorAll('iframe[data-tally-src]:not([src])')
														.forEach(function (e) {
															e.src = e.dataset.tallySrc;
														});
										};
									if ('undefined' != typeof Tally) v();
									else if (d.querySelector('script[src="' + w + '"]') == null) {
										var s = d.createElement('script');
										((s.src = w), (s.onload = v), (s.onerror = v), d.body.appendChild(s));
									}
								</script>
							</div>
						</div>
					{:else}
						<div class="empty">
							<div class="empty-icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="48"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="icon icon-tabler icons-tabler-outline icon-tabler-forms"
									><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
										d="M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3"
									/><path d="M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3" /><path
										d="M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7"
									/><path d="M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1" /><path
										d="M17 12h.01"
									/><path d="M13 12h.01" /></svg
								>
							</div>
							<p class="empty-title">Aucun formulaire disponible</p>
							<p class="empty-subtitle text-secondary">
								Aucun formulaire de récapitulatif n'a été configuré pour cette édition.
							</p>
						</div>
					{/if}
				</div>
			{/if}

			{#if activeTab === 'faq'}
				<div class="tab-pane active show">
					<div class="space-y-4">
						<div>
							<h2 class="mb-3">I. Délais et Automatisations</h2>
							<div
								id="faq-1"
								class="accordion accordion-tabs"
								role="tablist"
								aria-multiselectable="true"
							>
								<div class="accordion-item bg-primary-lt">
									<div class="accordion-header">
										<button
											class="accordion-button"
											data-bs-toggle="collapse"
											data-bs-target="#faq-1-1"
											role="tab"
										>
											Rigueur sur les horaires de rendu
											<div class="accordion-button-toggle">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-1"><path d="M6 9l6 6l6 -6"></path></svg
												>
											</div>
										</button>
									</div>
									<div
										id="faq-1-1"
										class="accordion-collapse collapse show"
										role="tabpanel"
										data-bs-parent="#faq-1"
									>
										<div class="accordion-body pt-0">
											<p>
												La gestion du challenge est automatisée par une plateforme informatique : <strong
													>"avant l'heure c'est pas l'heure, et après l'heure c'est plus l'heure"</strong
												>. Ne rendez pas votre projet au dernier moment ou pile à l'heure. Tout
												retard, même d'une seconde, bloque techniquement la suite du tournage.
											</p>
										</div>
									</div>
								</div>

								<div class="accordion-item">
									<div class="accordion-header">
										<button
											class="accordion-button collapsed"
											data-bs-toggle="collapse"
											data-bs-target="#faq-1-2"
											role="tab"
										>
											Procédure en cas d'imprévu
											<div class="accordion-button-toggle">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-1"><path d="M6 9l6 6l6 -6"></path></svg
												>
											</div>
										</button>
									</div>
									<div
										id="faq-1-2"
										class="accordion-collapse collapse"
										role="tabpanel"
										data-bs-parent="#faq-1"
									>
										<div class="accordion-body pt-0">
											<p>
												Le planning est millimétré. Si un événement exceptionnel vous empêche de
												respecter votre créneau, prévenez l'équipe immédiatement pour permettre une
												réorganisation de l'ordre de passage et éviter de paralyser le projet.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h2 class="mb-3">II. Développement et Liberté Créative</h2>
							<div
								id="faq-2"
								class="accordion accordion-tabs"
								role="tablist"
								aria-multiselectable="true"
							>
								<div class="accordion-item">
									<div class="accordion-header">
										<button
											class="accordion-button collapsed"
											data-bs-toggle="collapse"
											data-bs-target="#faq-2-1"
											role="tab"
										>
											Modifications du contenu existant
											<div class="accordion-button-toggle">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-1"><path d="M6 9l6 6l6 -6"></path></svg
												>
											</div>
										</button>
									</div>
									<div
										id="faq-2-1"
										class="accordion-collapse collapse"
										role="tabpanel"
										data-bs-parent="#faq-2"
									>
										<div class="accordion-body pt-0">
											<p>
												Vous êtes libres de modifier le travail des développeurs précédents
												(mécaniques, textures, refactorisation) ou d'ajouter votre propre univers.
												L'essentiel est de maintenir une cohérence globale tout en apportant votre
												touche personnelle.
											</p>
										</div>
									</div>
								</div>

								<div class="accordion-item">
									<div class="accordion-header">
										<button
											class="accordion-button collapsed"
											data-bs-toggle="collapse"
											data-bs-target="#faq-2-2"
											role="tab"
										>
											Arbitrage entre contenu et corrections
											<div class="accordion-button-toggle">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-1"><path d="M6 9l6 6l6 -6"></path></svg
												>
											</div>
										</button>
									</div>
									<div
										id="faq-2-2"
										class="accordion-collapse collapse"
										role="tabpanel"
										data-bs-parent="#faq-2"
									>
										<div class="accordion-body pt-0">
											<p>
												Ne consacrez pas l'intégralité de votre temps à la correction de bugs
												mineurs. Priorisez l'ajout de contenu visible pour la vidéo. Cependant, si
												un bug majeur rend le projet instable, sa résolution devient prioritaire.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h2 class="mb-3">III. Conformité et Rendu</h2>
							<div
								id="faq-3"
								class="accordion accordion-tabs"
								role="tablist"
								aria-multiselectable="true"
							>
								<div class="accordion-item">
									<div class="accordion-header">
										<button
											class="accordion-button collapsed"
											data-bs-toggle="collapse"
											data-bs-target="#faq-3-1"
											role="tab"
										>
											Usage d'assets et droits d'auteur
											<div class="accordion-button-toggle">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-1"><path d="M6 9l6 6l6 -6"></path></svg
												>
											</div>
										</button>
									</div>
									<div
										id="faq-3-1"
										class="accordion-collapse collapse"
										role="tabpanel"
										data-bs-parent="#faq-3"
									>
										<div class="accordion-body pt-0">
											<p>
												Les créations originales sont privilégiées. En cas d'utilisation d'assets
												externes, assurez-vous qu'ils soient strictement <strong
													>libres de droit pour un usage commercial</strong
												>, particulièrement pour l'aspect sonore (musiques et SFX).
											</p>
										</div>
									</div>
								</div>

								<div class="accordion-item">
									<div class="accordion-header">
										<button
											class="accordion-button collapsed"
											data-bs-toggle="collapse"
											data-bs-target="#faq-3-2"
											role="tab"
										>
											Nettoyage du projet avant transfert
											<div class="accordion-button-toggle">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-1"><path d="M6 9l6 6l6 -6"></path></svg
												>
											</div>
										</button>
									</div>
									<div
										id="faq-3-2"
										class="accordion-collapse collapse"
										role="tabpanel"
										data-bs-parent="#faq-3"
									>
										<div class="accordion-body pt-0">
											<p>
												Par respect pour le participant suivant, nettoyez votre archive en
												supprimant les fichiers non essentiels (caches, dépendances lourdes type
												node_modules, build logs) afin de faciliter le transfert.
											</p>
										</div>
									</div>
								</div>

								<div class="accordion-item">
									<div class="accordion-header">
										<button
											class="accordion-button collapsed"
											data-bs-toggle="collapse"
											data-bs-target="#faq-3-3"
											role="tab"
										>
											Licence et aspect communautaire
											<div class="accordion-button-toggle">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="icon icon-1"><path d="M6 9l6 6l6 -6"></path></svg
												>
											</div>
										</button>
									</div>
									<div
										id="faq-3-3"
										class="accordion-collapse collapse"
										role="tabpanel"
										data-bs-parent="#faq-3"
									>
										<div class="accordion-body pt-0">
											<p>
												Le projet est sous licence <strong>GPL v3</strong>. Cette licence garantit
												l'absence de litiges entre participants et permet le partage futur avec la
												communauté. L'acceptation de cette clause est indispensable pour participer.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
