import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

// POST - Créer un nouveau tournage
export const POST = async ({ request, locals }) => {
  // Vérification admin
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    return json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { name } = await request.json();

  if (!name || name.trim() === '') {
    return json({ error: 'Le nom du tournage est requis' }, { status: 400 });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO tournages (name, archive, created_at) VALUES (?, 0, NOW())',
      [name.trim()]
    );

    const [rows] = await db.query(
      `SELECT t.id, t.name, t.archive, t.created_at,
              COUNT(p.id) as participants,
              0 as progression
       FROM tournages t
       LEFT JOIN passage p ON p.tournages_id = t.id
       WHERE t.id = ?
       GROUP BY t.id`,
      [result.insertId]
    );

    return json({ success: true, tournage: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Erreur création tournage:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};
