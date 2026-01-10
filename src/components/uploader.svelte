<script>
	import Uppy from '@uppy/core';
	import Dashboard from '@uppy/dashboard';
	import XHR from '@uppy/xhr-upload';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';

	import '@uppy/core/css/style.min.css';
	import '@uppy/dashboard/css/style.min.css';

	export let tournage = null;
	export let disabled = false;

	let uppyInstance;
	let localDisabled = false;

	const getNote = () => {
		if (!tournage?.drive) return 'Configurez un dossier Drive pour ce tournage';
		
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
			localDisabled = true;
		});

		uppyInstance.on('upload-error', (file, error) => {
			console.error('Erreur upload:', file.name, error);
		});

		return () => {
			if (!uppyInstance) return;

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
				theme: ($theme === 'dark' ? 'dark' : 'light'),
				width: "100%"
			});
		}
	}
</script>
<div id="uppy-dashboard"></div>