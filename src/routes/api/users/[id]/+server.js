import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const PATCH = async ({ params, request, locals }) => {
	if (!locals.user || locals.user.rank !== 'Administrateur') {
		return json({ error: 'Non autorisé' }, { status: 403 });
	}

	const { id } = params;
	const { rank } = await request.json();

	if (!rank || !['Administrateur', 'Utilisateur'].includes(rank)) {
		return json({ error: 'Grade invalide' }, { status: 400 });
	}

	try {
		await db.query('UPDATE users SET `rank` = ? WHERE id = ?', [rank, id]);
		return json({ success: true, rank });
	} catch (error) {
		console.error('Erreur lors de la mise à jour du grade:', error);
		return json({ error: 'Erreur serveur' }, { status: 500 });
	}
};
