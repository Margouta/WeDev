import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET = async ({ cookies }) => {
  const session = cookies.get('session');
  if (session) {
    await db.query('DELETE FROM sessions WHERE id = ?', [session]);
  }

  cookies.delete('session', { path: '/' });
  throw redirect(302, '/');
};
