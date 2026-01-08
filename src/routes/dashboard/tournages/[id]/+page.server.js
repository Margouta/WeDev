import { redirect, error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load = async ({ locals, params }) => {
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    throw redirect(302, '/login');
  }

  const [rows] = await db.query('SELECT * FROM tournages WHERE id = ?', [params.id]);

  if (rows.length === 0) {
    throw error(404, 'Tournage non trouvé');
  }

  // Récupérer les participants
  const [passages] = await db.query(`
    SELECT 
      p.*, 
      u.username, 
      u.displayname, 
      u.avatar, 
      u.id as user_pk
    FROM passage p 
    LEFT JOIN users u ON p.discord_id = u.discord_id 
    WHERE p.tournages_id = ? 
    ORDER BY p.start_time ASC, p.id ASC`, 
    [params.id]
  );
  
  return {
    user: locals.user,
    tournage: rows[0],
    passages
  };
};

export const actions = {
    bulkAdd: async ({ request, params }) => {
        const formData = await request.formData();
        const discordIdsRaw = formData.get('discord_ids');

        if (!discordIdsRaw) {
            return fail(400, { missing: true });
        }

        const discordIds = discordIdsRaw.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (discordIds.length === 0) {
            return fail(400, { noIds: true });
        }

        const values = discordIds.map(dId => [
            crypto.randomUUID(), // id
            params.id,           // tournages_id
            dId,                 // discord_id
            null,                // start_time
            null,                // end_time
            'pending'            // status
        ]);

        try {
            const query = 'INSERT INTO passage (id, tournages_id, discord_id, start_time, end_time, status) VALUES ?';
            await db.query(query, [values]);
            return { success: true, count: discordIds.length };
        } catch (e) {
            console.error('Erreur bulk insert passage:', e);
            return fail(500, { dbError: true, message: e.message });
        }
    },
    deleteMember: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        if (!id) return fail(400, { missingId: true });

        try {
            await db.query('DELETE FROM passage WHERE id = ?', [id]);
            return { success: true };
        } catch (e) {
            console.error('Erreur delete passage:', e);
            return fail(500, { dbError: true });
        }
    },
    editMember: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const start_time = formData.get('start_time') || null;
        const end_time = formData.get('end_time') || null;
        const status = formData.get('status');

        if (!id) return fail(400, { missingId: true });

        try {
            await db.query(
                'UPDATE passage SET start_time = ?, end_time = ?, status = ? WHERE id = ?', 
                [start_time, end_time, status, id]
            );
            return { success: true };
        } catch (e) {
            console.error('Erreur edit passage:', e);
            return fail(500, { dbError: true });
        }
    }
};