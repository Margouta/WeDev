import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
export const load = async ({ locals }) => {
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    throw redirect(302, '/login');
  }

  const [tournages] = await db.query(
    `SELECT t.id, t.name, t.archive, t.created_at, t.brief, t.form, t.drive,
            COUNT(p.id) as participants,
            SUM(CASE WHEN p.end_time IS NOT NULL AND p.end_time <= NOW() THEN 1 ELSE 0 END) as done_count
     FROM tournages t
     LEFT JOIN passage p ON p.tournages_id = t.id
     GROUP BY t.id
     ORDER BY t.created_at DESC`
  );
  // Calculer la progression en pourcentage
  tournages.forEach(t => {
    t.progression = t.participants > 0 ? Math.round((t.done_count / t.participants) * 100) : 0;
  });

  return {
    user: locals.user,
    tournages
  };
};