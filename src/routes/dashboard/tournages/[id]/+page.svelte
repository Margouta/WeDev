<script>
	import Navbar from '../../../../components/navbar.svelte';
	import { enhance } from '$app/forms';
	export let data;
	export let form;
	let pageTitle = `${data.tournage.name} - ${data.appName}`;

	let isSubmitting = false;
	let editingMember = null;

	// Fonction utilitaire pour le statut
	function getStatusInfo(p) {
		const now = new Date();
		const start = p.start_time ? new Date(p.start_time) : null;
		const end = p.end_time ? new Date(p.end_time) : null;

		// 1. Statuts prioritaires (stockés en base)
		if (p.status === 'submitted') return { label: 'Rendu', color: 'bg-purple' };
		if (p.status === 'absent') return { label: 'Absent', color: 'bg-danger' };

		// 2. Pas de planning -> En attente
		if (!start || !end) {
			return { label: 'En attente', color: 'bg-secondary' };
		}

		// 3. Statuts calculés automatiquement selon l'heure
		if (now > end) return { label: 'Terminé', color: 'bg-success' };
		if (now >= start && now <= end) return { label: 'En cours', color: 'bg-primary' };

		// now < start
		return { label: 'Prêt', color: 'bg-info' };
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content="Gestion des passages et membres de {data.tournage.name}" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content="Gestion des passages et membres" />
</svelte:head>

<Navbar user={data.user} />

<div class="page-wrapper">
	<div class="page-header d-print-none">
		<div class="container-xl">
			<div class="row g-2 align-items-center">
				<div class="col">
					<div class="page-pretitle">{data.tournage.name}</div>
					<h2 class="page-title">Gestion des passages</h2>
				</div>
				<div class="col-auto ms-auto d-print-none">
					<div class="btn-list">
						<button
							class="btn btn-primary"
							data-bs-toggle="modal"
							data-bs-target="#modal-bulk-add-members"
						>
							Ajouter des membres en masse
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="page-body">
		<div class="container-xl">
			<div class="card">
				<div class="table-responsive">
					<table class="table card-table table-vcenter text-nowrap">
						<thead>
							<tr>
								<th class="w-1">Avatar</th>
								<th>Nom</th>
								<th>ID Discord</th>
								<th>Début</th>
								<th>Fin</th>
								<th>Statut</th>
								<th>CGU</th>
								<th>Rendu</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each data.passages as p}
								{@const status = getStatusInfo(p)}
								<tr>
									<td>
										{#if p.avatar}
											<span
												class="avatar avatar-sm"
												style="background-image: url(https://cdn.discordapp.com/avatars/{p.discord_id}/{p.avatar})"
											></span>
										{:else}
											<span
												class="avatar avatar-sm"
												style="background-image: url(https://ui-avatars.com/api/?name={p.displayname ||
													p.username ||
													'User'}&background=random)"
											></span>
										{/if}
									</td>
									<td>
										{#if p.user_pk}
											<div class="d-flex py-1 align-items-center">
												<div class="flex-fill">
													<div class="font-weight-medium">{p.displayname || p.username}</div>
													{#if p.displayname && p.displayname !== p.username}
														<div class="text-secondary">
															<a href="#" class="text-reset">@{p.username}</a>
														</div>
													{/if}
												</div>
											</div>
										{:else}
											<span class="text-secondary fst-italic">Inconnu</span>
										{/if}
									</td>
									<td><span class="text-muted">{p.discord_id}</span></td>
									<td>
										{#if p.start_time}
											{new Date(p.start_time).toLocaleString()}
										{:else}
											<span class="text-muted">–</span>
										{/if}
									</td>
									<td>
										{#if p.end_time}
											{new Date(p.end_time).toLocaleString()}
										{:else}
											<span class="text-muted">–</span>
										{/if}
									</td>
									<td>
										<span class="badge {status.color} me-1"></span>
										{status.label}
									</td>
									<td>
										{#if p.cgu}
											<span class="text-success">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="icon icon-tabler icon-tabler-checkbox"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													stroke-width="2"
													stroke="currentColor"
													fill="none"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
														d="M9 11l3 3l8 -8"
													/><path
														d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"
													/>
												</svg>
											</span>
										{:else}
											<span class="text-secondary">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="icon icon-tabler icon-tabler-square"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													stroke-width="2"
													stroke="currentColor"
													fill="none"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
														d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"
													/>
												</svg>
											</span>
										{/if}
									</td>
									<td>
										{#if p.rendu}
											<div class="d-flex align-items-center gap-2">
												<a href={p.rendu} target="_blank" rel="noopener noreferrer" class="link">Lien Drive</a>
												<button
													class="btn btn-sm btn-icon btn-ghost-danger"
													title="Supprimer le rendu"
													on:click={async () => {
														if (!confirm('Supprimer ce rendu de Drive et repasser en pending ?')) return;
														try {
															const response = await fetch(`/api/tournages/${data.tournage.id}/delete-rendu`, {
																method: 'POST',
																headers: { 'Content-Type': 'application/json' },
																body: JSON.stringify({ passageId: p.id })
															});
															const result = await response.json();
															if (response.ok && result.success) {
																window.location.reload();
															} else {
																alert(result.error || 'Erreur lors de la suppression');
															}
														} catch (error) {
															console.error('Erreur:', error);
															alert('Erreur de connexion');
														}
													}}
												>
													<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
														<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
														<path d="M4 7l16 0" />
														<path d="M10 11l0 6" />
														<path d="M14 11l0 6" />
														<path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
														<path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
													</svg>
												</button>
											</div>
										{:else}
											<span class="text-muted">–</span>
										{/if}
									</td>
									<td class="text-end">
										<div class="d-flex justify-content-end gap-2">
											<button
												class="btn btn-sm btn-outline-primary"
												data-bs-toggle="modal"
												data-bs-target="#modal-edit-member"
												on:click={() => (editingMember = p)}
											>
												Modifier
											</button>
											<form action="?/deleteMember" method="POST" use:enhance>
												<input type="hidden" name="id" value={p.id} />
												<button
													type="submit"
													class="btn btn-sm btn-outline-danger"
													on:click={(e) =>
														!confirm('Voulez-vous vraiment supprimer ce membre ?') &&
														e.preventDefault()}
												>
													Supprimer
												</button>
											</form>
										</div>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="7" class="text-center py-4">
										<div class="empty">
											<div class="empty-icon">
												<!-- Download SVG icon from http://tabler-icons.io/i/users -->
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="icon"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													stroke-width="2"
													stroke="currentColor"
													fill="none"
													stroke-linecap="round"
													stroke-linejoin="round"
													><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
														d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"
													/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path
														d="M16 3.13a4 4 0 0 1 0 7.75"
													/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg
												>
											</div>
											<p class="empty-title">Aucun membre</p>
											<p class="empty-subtitle text-muted">
												Ce tournage n'a pas encore de participants.
											</p>
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

<!-- Modal Edition membre -->
<div class="modal modal-blur fade" id="modal-edit-member" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Modifier le membre</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			{#if editingMember}
				<form
					method="POST"
					action="?/editMember"
					use:enhance={() => {
						return async ({ update, result }) => {
							await update();
							if (result.type === 'success') {
								const modal = document.getElementById('modal-edit-member');
								const closeBtn = modal?.querySelector('[data-bs-dismiss="modal"]');
								if (closeBtn) closeBtn.click();
							}
						};
					}}
				>
					<input type="hidden" name="id" value={editingMember.id} />
					<div class="modal-body">
						<div class="mb-3">
							<div class="form-label">Membre</div>
							<div class="form-control-plaintext">
								{editingMember.displayname || editingMember.username || editingMember.discord_id}
							</div>
						</div>
						<div class="row">
							<div class="col-lg-6">
								<div class="mb-3">
									<label class="form-label" for="edit_start_time">Début</label>
									<input
										type="datetime-local"
										class="form-control"
										name="start_time"
										id="edit_start_time"
										value={editingMember.start_time
											? new Date(
													new Date(editingMember.start_time).getTime() -
														new Date().getTimezoneOffset() * 60000
												)
													.toISOString()
													.slice(0, 16)
											: ''}
									/>
								</div>
							</div>
							<div class="col-lg-6">
								<div class="mb-3">
									<label class="form-label" for="edit_end_time">Fin</label>
									<input
										type="datetime-local"
										class="form-control"
										name="end_time"
										id="edit_end_time"
										value={editingMember.end_time
											? new Date(
													new Date(editingMember.end_time).getTime() -
														new Date().getTimezoneOffset() * 60000
												)
													.toISOString()
													.slice(0, 16)
											: ''}
									/>
								</div>
							</div>
						</div>
						<div class="mb-3">
							<label class="form-label" for="edit_status">Statut</label>
							<select
								class="form-select"
								name="status"
								id="edit_status"
								value={editingMember.status}
							>
								<option value="pending">Automatique (En attente/Prêt/En cours/Terminé)</option>
								<option value="absent">Absent</option>
								<option value="submitted">Rendu</option>
							</select>
							<div class="form-text text-muted">
								Le statut "Automatique" se base sur les horaires :<br />
								- Pas d'horaires : En attente<br />
								- Avant l'heure : Prêt<br />
								- Pendant : En cours<br />
								- Après : Terminé
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-link link-secondary" data-bs-dismiss="modal">
							Annuler
						</button>
						<button type="submit" class="btn btn-primary ms-auto"> Enregistrer </button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>

<!-- Modal Nouveau membres en masse -->
<div class="modal modal-blur fade" id="modal-bulk-add-members" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Ajouter des membres</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<form
				method="POST"
				action="?/bulkAdd"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update, result }) => {
						await update();
						isSubmitting = false;
						if (result.type === 'success') {
							// Fermer le modal si succès
							const modal = document.getElementById('modal-bulk-add-members');
							const closeBtn = modal?.querySelector('[data-bs-dismiss="modal"]');
							if (closeBtn) closeBtn.click();
						}
					};
				}}
			>
				<div class="modal-body">
					{#if form?.missing}
						<div class="alert alert-danger">Veuillez remplir tous les champs.</div>
					{/if}
					{#if form?.noIds}
						<div class="alert alert-danger">Aucun ID Discord valide détecté.</div>
					{/if}
					{#if form?.dbError}
						<div class="alert alert-danger">Erreur base de données: {form.message}</div>
					{/if}

					<div class="mb-3">
						<label class="form-label" for="discord_ids">IDs Discord (un par ligne)</label>
						<textarea
							class="form-control"
							id="discord_ids"
							name="discord_ids"
							rows="5"
							placeholder="123456789&#10;987654321"
							required
						></textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-link link-secondary" data-bs-dismiss="modal">
						Annuler
					</button>
					<button type="submit" class="btn btn-primary ms-auto" disabled={isSubmitting}>
						<!-- Download SVG icon from http://tabler-icons.io/i/plus -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="icon"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path
								d="M5 12l14 0"
							/></svg
						>
						{isSubmitting ? 'Ajout...' : 'Ajouter les membres'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
