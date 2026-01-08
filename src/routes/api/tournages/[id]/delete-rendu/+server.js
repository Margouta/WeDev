import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { google } from 'googleapis';
import { DRIVESA_EMAIL, DRIVESA_PRIVATE_KEY } from '$env/static/private';

export const POST = async ({ request, params, locals }) => {
  // Vérification admin
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    return json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = params; // ID du tournage
  const { passageId } = await request.json();

  if (!passageId) {
    return json({ error: 'ID de passage manquant' }, { status: 400 });
  }

  try {
    // Récupérer le lien du rendu pour extraire l'ID du fichier
    const [rows] = await db.query('SELECT rendu FROM passage WHERE id = ?', [passageId]);
    
    if (!rows || rows.length === 0) {
      return json({ error: 'Passage non trouvé' }, { status: 404 });
    }

    const passage = rows[0];
    
    if (!passage.rendu) {
      return json({ error: 'Aucun rendu à supprimer' }, { status: 400 });
    }

    // Extraire l'ID du fichier depuis l'URL Drive
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileIdMatch = passage.rendu.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];

      // Configurer l'authentification Google Drive
      const auth = new google.auth.JWT({
        email: DRIVESA_EMAIL,
        key: DRIVESA_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      const drive = google.drive({ version: 'v3', auth });

      // Supprimer le fichier de Google Drive
      try {
        await drive.files.delete({
          fileId: fileId,
          supportsAllDrives: true
        });
        console.log('Fichier supprimé de Drive:', fileId);
      } catch (driveError) {
        console.warn('Erreur lors de la suppression du fichier Drive (peut-être déjà supprimé):', driveError.message);
      }
    }

    // Mettre à jour le passage : supprimer le rendu et repasser en pending
    await db.query(
      'UPDATE passage SET rendu = NULL, status = ? WHERE id = ?',
      ['pending', passageId]
    );

    return json({ 
      success: true, 
      message: 'Rendu supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression rendu:', error);
    return json({ error: 'Erreur serveur: ' + error.message }, { status: 500 });
  }
};
