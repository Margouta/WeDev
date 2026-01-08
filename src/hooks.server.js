import { db } from '$lib/server/db';

export const handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    const [rows] = await db.query(
      `SELECT users.*
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ?
       AND sessions.expires_at > NOW()`,
      [sessionId]
    );

    if (rows.length) {
      event.locals.user = rows[0];
    }
  }

  return resolve(event);
};
