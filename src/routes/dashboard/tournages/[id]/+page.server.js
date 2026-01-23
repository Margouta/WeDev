import { redirect, error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { google } from 'googleapis';
import { DRIVESA_EMAIL, DRIVESA_PRIVATE_KEY } from '$env/static/private';

// Construit un client JWT Google Drive avec clé normalisée
function buildDriveAuth() {
  const normalizedKey = DRIVESA_PRIVATE_KEY?.replace(/\r/g, '\n').replace(/\\n/g, '\n').trim();
  if (!normalizedKey || !normalizedKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Clé privée Google Drive invalide ou manquante');
  }
  return new google.auth.JWT({
    email: DRIVESA_EMAIL,
    key: normalizedKey,
    // Scope complet pour accéder/supprimer des fichiers d'un shared drive
    scopes: ['https://www.googleapis.com/auth/drive']
  });
}

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

// Fonction utilitaire pour supprimer un fichier de Google Drive
async function deleteFromGoogleDrive(fileUrl) {
  try {
    const fileIdMatch = fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (!fileIdMatch) {
      console.warn('Impossible d\'extraire l\'ID du fichier de l\'URL:', fileUrl);
      return false;
    }

    const fileId = fileIdMatch[1];
    const auth = buildDriveAuth();
    const drive = google.drive({ version: 'v3', auth });

    try {
      await drive.files.delete({ fileId, supportsAllDrives: true });
      console.log('Fichier supprimé de Drive:', fileId);
      return true;
    } catch (deleteError) {
      const msg = deleteError?.errors?.[0]?.message || deleteError.message || '';
      if (msg.includes('File not found')) {
        console.warn('Fichier introuvable (peut-être déjà supprimé):', fileId);
        return false;
      }
      if (msg.includes('insufficient permissions') || msg.includes('not have sufficient permissions')) {
        console.error('Permissions Drive insuffisantes pour supprimer le fichier:', msg);
        return false;
      }
      console.error('Erreur lors de la suppression du fichier Drive:', msg);
      return false;
    }
  } catch (driveError) {
    console.warn('Erreur lors de la suppression du fichier Drive:', driveError.message);
    return false;
  }
}

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
            // Récupérer le passage pour vérifier s'il a un rendu
            const [rows] = await db.query('SELECT rendu FROM passage WHERE id = ?', [id]);
            
            if (rows && rows.length > 0 && rows[0].rendu) {
                // Si le passage a un rendu, supprimer le fichier de Google Drive
                await deleteFromGoogleDrive(rows[0].rendu);
            }

            // Ensuite supprimer le passage
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