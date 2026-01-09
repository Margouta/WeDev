<script>
	import Uppy from '@uppy/core';
	import Dashboard from '@uppy/dashboard';
	import XHR from '@uppy/xhr-upload';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';

	import '@uppy/core/css/style.min.css';
	import '@uppy/dashboard/css/style.min.css';

	export let tournage = null;
	export let disabled = false; // désactive l'upload (ex: déjà soumis)

	let uppyInstance;
	let localDisabled = false; // se bloque localement après un succès

	const getNote = () => {
		if (!tournage?.drive) return 'Configurez un dossier Drive pour ce tournage';
		
		// Vérifier si le passage a commencé
		const now = new Date();
		const startTime = tournage?.start_time ? new Date(tournage.start_time) : null;
		if (startTime && startTime > now) {
			return 'Upload désactivé (passage non commencé)';
		}
		
		if (disabled || localDisabled || tournage?.status === 'submitted') return 'Upload désactivé (déjà soumis)';
		return 'Upload vers Google Drive (.zip, 1 fichier)';
	};

	$: effectiveDisabled = disabled || localDisabled || !tournage?.drive || tournage?.status === 'submitted';

	onMount(() => {
		if (!tournage) {
			return;
		}

		uppyInstance = new Uppy({
			debug: true,
			autoProceed: false,
			restrictions: {
				allowedFileTypes: ['.zip'],
				maxNumberOfFiles: 1
			}
		});

		uppyInstance.use(Dashboard, {
			inline: true,
			target: '#uppy-dashboard',
			proudlyDisplayPoweredByUppy: true,
			note: getNote(),
			disabled: effectiveDisabled,
			// Sync Uppy theme with app theme (dark/light)
			theme: ($theme === 'dark' ? 'dark' : 'light')
		});

		uppyInstance.use(XHR, {
			endpoint: `/api/tournages/${tournage.id}/upload`,
			method: 'POST',
			formData: true,
			fieldName: 'files'
		});

		uppyInstance.on('upload-success', (file, response) => {
			console.log('Upload réussi:', file.name, response.body);
			localDisabled = true; // bloque les prochains uploads dans la session
		});

		uppyInstance.on('upload-error', (file, error) => {
			console.error('Erreur upload:', file.name, error);
		});

		return () => {
			if (!uppyInstance) return;

			// Some Uppy versions do not expose close(), so guard to avoid runtime errors
			if (typeof uppyInstance.close === 'function') {
				uppyInstance.close({ reason: 'component-unmount' });
			} else {
				uppyInstance.getPlugin('Dashboard')?.unmount?.();
				uppyInstance.cancelAll?.({ reason: 'component-unmount' });
			}

			uppyInstance = null;
		};
	});

	$: if (uppyInstance) {
		const dashboard = uppyInstance.getPlugin('Dashboard');
		if (dashboard) {
			dashboard.setOptions({
				disabled: effectiveDisabled,
				note: getNote(),
				theme: ($theme === 'dark' ? 'dark' : 'light')
			});
		}
	}
</script>

<div id="uppy-dashboard"></div>
<style>
	#uppy-dashboard {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	:global(#uppy-dashboard .uppy-Dashboard) {
		height: 100% !important;
		min-height: 350px;
	}

	:global(#uppy-dashboard .uppy-Dashboard-inner) {
		height: 100% !important;
	}

	:global(#uppy-dashboard .uppy-DashboardContent) {
		height: 100%;
	}
</style>
