import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  const [rows] = await db.query(
    `SELECT 
  t.id,
  t.name,
  t.archive,
  t.created_at,
  t.brief,
  t.form,
  t.drive,
  p.id AS passage_id,
  p.start_time,
  p.end_time,
  p.status,
  p.cgu,
  p.rendu,
  p.discord_id,
  ROW_NUMBER() OVER (
    PARTITION BY t.id
    ORDER BY p.start_time ASC
  ) AS passage_number
FROM tournages t
INNER JOIN passage p ON p.tournages_id = t.id
WHERE t.archive = 0
ORDER BY t.created_at DESC, p.start_time ASC;
`
  );

  const tournages = [];
  const seen = new Set();

  rows.forEach(row => {
    // Filtrer seulement les passages de l'utilisateur connecté
    if (row.discord_id !== locals.user.discord_id) return;
    if (seen.has(row.id)) return;
    seen.add(row.id);
    tournages.push(row);
  });

  // Pour chaque tournage, récupérer le rendu du passage précédent non-absent
  for (const tournage of tournages) {
    if (tournage.passage_number > 1) {
      // Chercher le premier passage avant celui-ci qui a un rendu ET n'est pas absent
      const [prevRows] = await db.query(
        `SELECT rendu FROM passage 
         WHERE tournages_id = ? 
         AND status IN ('submitted', 'pending')
         AND start_time < (
           SELECT start_time FROM passage 
           WHERE tournages_id = ? AND discord_id = ?
         )
         ORDER BY start_time DESC
         LIMIT 1`,
        [tournage.id, tournage.id, locals.user.discord_id]
      );
      if (prevRows && prevRows.length > 0 && prevRows[0].rendu) {
        tournage.previous_rendu = prevRows[0].rendu;
      }
    }
  }

  return {
    user: locals.user,
    tournages
  };
};

export const actions = {
  acceptCgu: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(302, '/login');
    }

    const formData = await request.formData();
    const passageId = formData.get('passage_id');

    if (!passageId) {
      return fail(400, { message: 'Passage manquant' });
    }

    const [result] = await db.query(
      'UPDATE passage SET cgu = 1 WHERE id = ? AND discord_id = ?',
      [passageId, locals.user.discord_id]
    );

    if (result.affectedRows === 0) {
      return fail(404, { message: 'Passage non trouvé' });
    }

    return { success: true };
  }
};
