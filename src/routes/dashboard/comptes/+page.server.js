import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load = async ({ locals }) => {
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    throw redirect(302, '/login');
  }

  const [users] = await db.query(
    `SELECT id, discord_id, username, avatar, created_at, displayname, \`rank\`
     FROM users
     ORDER BY created_at DESC`
  );

  return {
    user: locals.user,
    users
  };
};