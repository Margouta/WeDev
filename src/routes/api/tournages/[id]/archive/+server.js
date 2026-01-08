import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

// PATCH - Archiver/Désarchiver un tournage
export const PATCH = async ({ params, locals }) => {
  // Vérification admin
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    return json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = params;

  try {
    // Toggle archive status (0 -> 1 ou 1 -> 0)
    await db.query('UPDATE tournages SET archive = 1 - archive WHERE id = ?', [id]);

    // Récupérer le nouveau statut
    const [rows] = await db.query('SELECT archive FROM tournages WHERE id = ?', [id]);

    if (rows.length === 0) {
      return json({ error: 'Tournage non trouvé' }, { status: 404 });
    }

    return json({ success: true, archive: rows[0].archive });
  } catch (error) {
    console.error('Erreur archivage tournage:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};
