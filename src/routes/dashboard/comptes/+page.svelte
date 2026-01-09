<script>
	import Navbar from '../../../components/navbar.svelte';
	export let data;

	let users = data.users;
	let isUpdating = false;
	let pageTitle = `Gestion des comptes - ${data.appName}`;
	let searchQuery = '';

	function badgeClass(rank) {
		return rank === 'Administrateur' ? 'bg-danger-lt' : 'bg-info-lt';
	}

	$: filteredUsers = searchQuery.trim() === ''
		? users
		: users.filter(
				(u) =>
					u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(u.displayname && u.displayname.toLowerCase().includes(searchQuery.toLowerCase())) ||
					u.discord_id.includes(searchQuery)
			);

	async function toggleRank(user) {
		if (isUpdating) return;
		
		const newRank = user.rank === 'Administrateur' ? 'Utilisateur' : 'Administrateur';
		const action = newRank === 'Administrateur' ? 'promouvoir' : 'rétrograder';
		
		if (!confirm(`Voulez-vous ${action} ${user.displayname || user.username} en tant que ${newRank} ?`)) {
			return;
		}

		isUpdating = true;
		try {
			const response = await fetch(`/api/users/${user.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rank: newRank })
			});

			const result = await response.json();
			if (response.ok && result.success) {
				users = users.map((u) =>
					u.id === user.id ? { ...u, rank: result.rank } : u
				);
			} else {
				alert(result.error || 'Erreur lors de la modification');
			}
		} catch (error) {
			console.error('Erreur:', error);
			alert('Erreur de connexion: ' + error.message);
		} finally {
			isUpdating = false;
		}
	}

</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content="Gérez les comptes utilisateurs et les permissions" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content="Gérez les comptes utilisateurs et les permissions" />
</svelte:head>

<Navbar user={data.user} />

<div class="page-wrapper">
	<div class="page-header d-print-none">
		<div class="container-xl">
			<div class="row g-2 align-items-center">
				<div class="col">
					<div class="page-pretitle">Vue d'ensemble</div>
					<h2 class="page-title">Gestion des comptes</h2>
				</div>
			</div>
		</div>
	</div>

	<div class="page-body">
		<div class="container-xl">
			<div class="card">
				<div class="card-header border-bottom">
					<div class="input-icon">
						<input
							type="text"
							class="form-control"
							placeholder="Rechercher un utilisateur..."
							bind:value={searchQuery}
						/>
						<span class="input-icon-addon">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
						</span>
					</div>
				</div>
				<div class="table-responsive">
					<table class="table card-table table-vcenter text-nowrap table-hover">
						<thead>
							<tr>
								<th>Avatar</th>
								<th>Nom</th>
								<th>ID Discord</th>
								<th>Grade</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each filteredUsers as user}
								<tr>
									<td>
										<span class="avatar avatar-sm" style="background-image: url(https://cdn.discordapp.com/avatars/{user.discord_id}/{user.avatar}.png)"></span>
									</td>
									<td>
										<div class="d-flex py-1 align-items-center">
											<div class="flex-fill">
												<div class="font-weight-medium">{user.displayname || '–'}</div>
												<div class="text-secondary">
													<a href="#" class="text-reset">@{user.username}</a>
												</div>
											</div>
										</div>
									</td>
									<td><span class="text-muted">{user.discord_id}</span></td>
									<td>
										<span class="badge {badgeClass(user.rank)}">{user.rank}</span>
									</td>
									<td>
										<button
											on:click={() => toggleRank(user)}
											class="btn btn-sm {user.rank === 'Administrateur' ? 'btn-outline-secondary' : 'btn-outline-primary'}"
											disabled={isUpdating}
										>
											{user.rank === 'Administrateur' ? 'Rétrograder' : 'Promouvoir'}
										</button>
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

