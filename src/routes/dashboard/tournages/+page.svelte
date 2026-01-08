<script>
	import Navbar from '../../../components/navbar.svelte';
	import 'quill/dist/quill.snow.css';
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	export let data;

	// État réactif pour les tournages
	let tournages = data.tournages;
	let newTournageName = '';
	let isSubmitting = false;
	let editingBrief = null;
	let currentBriefHtml = '';
	let isSavingBrief = false;
	let briefEditor;
	let quillInstance = null;
	let Quill;
	let openDropdown = null;
	let bootstrapLib = null;

	const getBootstrap = () => bootstrapLib ?? (typeof window !== 'undefined' ? window.bootstrap : undefined);

	onMount(() => {
		bootstrapLib = getBootstrap();
	});

	function closeOtherDropdowns(button) {
		const bs = getBootstrap();
		if (!bs?.Dropdown) return;

		if (openDropdown && openDropdown !== button) {
			bs.Dropdown.getInstance(openDropdown)?.hide();
		}

		const instance = bs.Dropdown.getOrCreateInstance(button);
		instance.toggle();

		const menu = button.nextElementSibling;
		openDropdown = menu?.classList.contains('show') ? button : null;
	}

	function badgeClass(archive) {
		return archive === 0 ? 'bg-success-lt' : 'bg-secondary-lt';
	}

	async function ensureQuill() {
		if (quillInstance) return;
		if (!Quill) {
			const mod = await import('quill');
			Quill = mod.default;
		}
		await tick();
		quillInstance = new Quill(briefEditor, {
			theme: 'snow',
			modules: {
				toolbar: [
					['bold', 'italic', 'underline', 'strike'], // toggled buttons
					['blockquote', 'code-block'],
					['link', 'image', 'video'],

					[{ header: 1 }, { header: 2 }], // custom button values
					[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
					[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
					[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
					[{ direction: 'rtl' }], // text direction

					[{ header: [1, 2, 3, 4, 5, 6, false] }],

					[{ color: [] }, { background: [] }], // dropdown with defaults from theme
					[{ align: [] }],

					['clean'] // remove formatting button
				]
			}
		});
		quillInstance.on('text-change', () => {
			currentBriefHtml = quillInstance.root.innerHTML;
		});
		if (currentBriefHtml) {
			quillInstance.clipboard.dangerouslyPasteHTML(currentBriefHtml);
		}
	}

	const waitFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

	async function renderBriefContent(html) {
		await ensureQuill();
		await tick();
		// Laisser au moins deux frames pour que Quill rende correctement dans le modal
		await waitFrame();
		await waitFrame();
		if (quillInstance) {
			quillInstance.setContents([]);
			quillInstance.clipboard.dangerouslyPasteHTML(html || '');
			quillInstance.setSelection(quillInstance.getLength(), 0);
		}
	}

	async function openBriefModal(t) {
		editingBrief = t;
		currentBriefHtml = t.brief || '';
		await renderBriefContent(currentBriefHtml);
	}

	async function saveBrief() {
		if (!editingBrief || isSavingBrief) return;
		isSavingBrief = true;
		if (!quillInstance) {
			await ensureQuill();
		}
		currentBriefHtml = quillInstance ? quillInstance.root.innerHTML : currentBriefHtml;

		try {
			const response = await fetch(`/api/tournages/${editingBrief.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ brief: currentBriefHtml })
			});

			const result = await response.json();
			if (response.ok && result.success) {
				tournages = tournages.map((item) =>
					item.id === editingBrief.id ? { ...item, brief: currentBriefHtml } : item
				);
				const modal = document.getElementById('modal-brief');
				if (modal && typeof bootstrap !== 'undefined') {
					const bsModal = bootstrap.Modal.getInstance(modal);
					if (bsModal) bsModal.hide();
				} else {
					const closeBtn = modal?.querySelector('[data-bs-dismiss="modal"]');
					if (closeBtn) closeBtn.click();
				}
			} else {
				alert(result.error || "Erreur lors de l'enregistrement du brief");
			}
		} catch (error) {
			console.error('Erreur:', error);
			alert('Erreur de connexion: ' + error.message);
		} finally {
			isSavingBrief = false;
		}
	}

	function statutText(archive) {
		return archive === 0 ? 'En cours' : 'Archivé';
	}

	// Ajouter un nouveau tournage
	async function addTournage() {
		if (!newTournageName.trim() || isSubmitting) return;

		isSubmitting = true;
		try {
			const response = await fetch('/api/tournages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newTournageName })
			});

			const result = await response.json();
			if (response.ok && result.success) {
				tournages = [result.tournage, ...tournages];
				newTournageName = '';
				// Liste mise à jour automatiquement par Svelte
				// Fermer le modal
				const modal = document.getElementById('modal-report');
				if (modal && typeof bootstrap !== 'undefined') {
					const bsModal = bootstrap.Modal.getInstance(modal);
					if (bsModal) bsModal.hide();
				} else {
					// Fallback: cliquer sur le bouton close
					const closeBtn = modal?.querySelector('[data-bs-dismiss="modal"]');
					if (closeBtn) closeBtn.click();
				}
			} else {
				alert(result.error || 'Erreur lors de la création');
			}
		} catch (error) {
			console.error('Erreur:', error);
			alert('Erreur de connexion: ' + error.message);
		} finally {
			isSubmitting = false;
		}
	}

	// Renommer un tournage
	async function renameTournage(t) {
		const newName = prompt('Nouveau nom du tournage:', t.name);
		if (!newName || newName.trim() === '' || newName === t.name) return;

		try {
			const response = await fetch(`/api/tournages/${t.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newName })
			});

			const result = await response.json();
			if (response.ok && result.success) {
				// Mettre à jour le tableau localement
				tournages = tournages.map((item) =>
					item.id === t.id ? { ...item, name: result.name } : item
				);
				// Liste mise à jour automatiquement par Svelte
			} else {
				alert(result.error || 'Erreur lors du renommage');
			}
		} catch (error) {
			console.error('Erreur:', error);
			alert('Erreur de connexion');
		}
	}

	// Archiver un tournage
	async function archiveTournage(t) {
		const action = t.archive === 0 ? 'archiver' : 'désarchiver';
		if (!confirm(`Voulez-vous ${action} ce tournage ?`)) return;

		try {
			const response = await fetch(`/api/tournages/${t.id}/archive`, {
				method: 'PATCH'
			});

			const result = await response.json();
			if (response.ok && result.success) {
				// Mettre à jour le tableau localement
				tournages = tournages.map((item) =>
					item.id === t.id ? { ...item, archive: result.archive } : item
				);
				// Liste mise à jour automatiquement par Svelte
			} else {
				alert(result.error || "Erreur lors de l'archivage");
			}
		} catch (error) {
			console.error('Erreur:', error);
			alert('Erreur de connexion');
		}
	}

	// Modifier l'URL du formulaire
	async function editFormUrl(t, event) {
		const newFormUrl = prompt('ID Tally du formulaire:', t.form || '');
		if (newFormUrl === null || newFormUrl === t.form) return;

		try {
			const response = await fetch(`/api/tournages/${t.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ form: newFormUrl })
			});

			const result = await response.json();
			if (response.ok && result.success) {
				tournages = tournages.map((item) =>
					item.id === t.id ? { ...item, form: newFormUrl } : item
				);
				// Fermer le dropdown
				if (event) {
						const dropdown = event.target.closest('.dropup, .dropdown');
						if (dropdown) {
							const btn = dropdown.querySelector('[data-bs-toggle="dropdown"]');
							const bs = getBootstrap();
							if (btn && bs?.Dropdown) {
								bs.Dropdown.getInstance(btn)?.hide();
							}
						}
				}
			} else {
				alert(result.error || 'Erreur lors de la modification');
			}
		} catch (error) {
			console.error('Erreur:', error);
			alert('Erreur de connexion');
		}
	}

	// Modifier l'URL du Drive
	async function editDriveUrl(t, event) {
		const message = 'Lien Google Drive du dossier:\n⚠️ Important : Partagez le dossier avec\nproduction@aywen-wedev.iam.gserviceaccount.com\nen tant qu\'éditeur';
		const newDriveUrl = prompt(message, t.drive || '');
		if (newDriveUrl === null || newDriveUrl === t.drive) return;

		console.log('Envoi de la requête PATCH pour drive:', { id: t.id, drive: newDriveUrl });

		try {
			const response = await fetch(`/api/tournages/${t.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ drive: newDriveUrl })
			});

			const result = await response.json();
			console.log('Réponse API:', result);

			if (response.ok && result.success) {
				tournages = tournages.map((item) =>
					item.id === t.id ? { ...item, drive: newDriveUrl } : item
				);
				console.log('Drive mis à jour localement');
				// Fermer le dropdown
				if (event) {
					const dropdown = event.target.closest('.dropup, .dropdown');
					if (dropdown) {
						const btn = dropdown.querySelector('[data-bs-toggle="dropdown"]');
						const bs = getBootstrap();
						if (btn && bs?.Dropdown) {
							bs.Dropdown.getInstance(btn)?.hide();
						}
					}
				}
			} else {
				console.error('Erreur API:', result);
				alert(result.error || 'Erreur lors de la modification');
			}
		} catch (error) {
			console.error('Erreur:', error);
			alert('Erreur de connexion');
		}
	}

	// Imports déplacés en haut du fichier
</script>

<Navbar user={data.user} />

<div class="page-wrapper">
	<div class="page-header d-print-none">
		<div class="container-xl">
			<div class="row g-2 align-items-center">
				<div class="col">
					<div class="page-pretitle">Vue d'ensemble</div>
					<h2 class="page-title">Gestion des tournages</h2>
				</div>
				<div class="col-auto ms-auto d-print-none">
					<div class="btn-list">
						<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-report">
							Nouveau tournage
						</button>
					</div>
				</div>
			</div>
			<style>
				.quill-wrapper .ql-container {
					min-height: 260px;
					border: none;
				}

				.quill-wrapper .ql-editor {
					min-height: 220px;
					padding: 0.75rem 1rem;
				}

				.quill-wrapper .ql-toolbar {
					border-radius: 0.375rem 0.375rem 0 0;
				}

				.quill-wrapper .ql-container.ql-snow {
					border-radius: 0 0 0.375rem 0.375rem;
				}

				.table-responsive {
					overflow: visible !important;
				}

				.card {
					overflow: visible !important;
				}

				tbody tr {
					overflow: visible !important;
				}

				.dropdown {
					position: relative;
				}
			</style>
		</div>
	</div>

	<div class="page-body">
		<div class="container-xl">
			<div class="card">
				<div class="table-responsive">
					<table class="table card-table table-vcenter text-nowrap table-hover">
						<thead>
							<tr>
								<th>Nom du tournage</th>
								<th>Création</th>
								<th>Participants</th>
								<th>Statut</th>
								<th>Progression</th>
								<th>Formulaire</th>
								<th>Drive</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each tournages as t}
								<tr on:click={() => goto(`/dashboard/tournages/${t.id}`)} style="cursor: pointer;">
									<td>{t.name}</td>
									<td>{new Date(t.created_at).toLocaleDateString()}</td>
									<td>{t.participants}</td>
									<td><span class="badge {badgeClass(t.archive)}">{statutText(t.archive)}</span></td
									>
									<td class="sort-progress" data-progress={t.progression}>
										<div class="row align-items-center">
											<div class="col-12 col-lg-auto">{t.progression}%</div>
											<div class="col">
												<div class="progress progress-2" style="width: 5rem">
													<div
														class="progress-bar"
														style="width: {t.progression}%"
														role="progressbar"
														aria-valuenow={t.progression}
														aria-valuemin="0"
														aria-valuemax="100"
														aria-label="{t.progression}% ({t.done_count ?? 0}/{t.participants})"
													>
														<span class="visually-hidden"
															>{t.progression}% ({t.done_count ?? 0}/{t.participants})</span
														>
													</div>
												</div>
											</div>
										</div>
									</td>
									<td>
										{#if t.form}
											<a href="https://tally.so/r/{t.form}" target="_blank" rel="noopener noreferrer" class="link">
												Formulaire
											</a>
										{:else}
											<span class="text-muted">–</span>
										{/if}
									</td>
									<td>
										{#if t.drive}
											<a href={t.drive} target="_blank" rel="noopener noreferrer" class="link">
												Drive
											</a>
										{:else}
											<span class="text-muted">–</span>
										{/if}
									</td>
									<td>
										<div class="d-flex gap-2">
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<div class="dropdown" on:click|stopPropagation>
												<button
													class="btn btn-sm btn-outline-secondary dropdown-toggle"
													type="button"
													data-bs-toggle="dropdown"
													data-bs-auto-close="true"
													data-bs-boundary="viewport"
													aria-expanded="false"
													on:click={(e) => closeOtherDropdowns(e.currentTarget)}
												>
													Actions
												</button>
												<ul class="dropdown-menu">
													<li>
														<button
															class="dropdown-item"
															type="button"
															on:click={(e) => editFormUrl(t, e)}
														>
															<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-forms me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3" /><path d="M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3" /><path d="M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7" /><path d="M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1" /><path d="M17 12h.01" /><path d="M13 12h.01" /></svg>
															Formulaire
														</button>
													</li>
													<li>
														<button
															class="dropdown-item"
															type="button"
															on:click={(e) => editDriveUrl(t, e)}
														>
															<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-google-drive me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 10l-6 10l-3 -5l6 -10z" /><path d="M9 15h12l-3 5h-12" /><path d="M15 15l-6 -10h6l6 10z" /></svg>
															Drive
														</button>
													</li>
													<li>
														<button
															class="dropdown-item"
															type="button"
															on:click={() => openBriefModal(t)}
															data-bs-toggle="modal"
															data-bs-target="#modal-brief"
														>
															<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-text me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 9l1 0" /><path d="M9 13l6 0" /><path d="M9 17l6 0" /></svg>
															Brief
														</button>
													</li>
												</ul>
											</div>
											<button
												on:click|stopPropagation={() => renameTournage(t)}
												class="btn btn-sm btn-outline-primary">Renommer</button
											>
											<button
												on:click|stopPropagation={() => archiveTournage(t)}
												class="btn btn-sm btn-outline-danger"
											>
												{t.archive === 0 ? 'Archiver' : 'Désarchiver'}
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Modal Nouveau Tournage -->
<div class="modal modal-blur fade" id="modal-report" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Nouveau tournage</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<form on:submit|preventDefault={addTournage}>
				<div class="modal-body">
					<div class="mb-3">
						<label class="form-label" for="tournage-name">Nom du tournage</label>
						<input
							type="text"
							class="form-control"
							id="tournage-name"
							bind:value={newTournageName}
							placeholder="Entrez le nom du tournage"
							required
						/>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn-link link-secondary btn-3" data-bs-dismiss="modal"
						>Annuler</button
					>
					<button type="submit" class="ms-auto btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Création...' : 'Créer'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- Modal Brief -->
<div class="modal modal-blur fade" id="modal-brief" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-xl modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Brief - {editingBrief?.name}</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="quill-wrapper">
					<div class="form-control p-0" style="min-height: 260px; overflow-y: auto;">
						<div class="quill-editor" bind:this={briefEditor}></div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-link link-secondary" data-bs-dismiss="modal"
					>Annuler</button
				>
				<button
					type="button"
					class="ms-auto btn btn-primary"
					on:click={saveBrief}
					disabled={isSavingBrief}
				>
					{isSavingBrief ? 'Enregistrement...' : 'Enregistrer'}
				</button>
			</div>
		</div>
	</div>
</div>
