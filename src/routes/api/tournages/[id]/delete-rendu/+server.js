import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { google } from 'googleapis';
import { DRIVESA_EMAIL, DRIVESA_PRIVATE_KEY } from '$env/static/private';

function buildDriveAuth() {
  // Normaliser les retours chariot pour éviter les erreurs OpenSSL/Node
  const normalizedKey = DRIVESA_PRIVATE_KEY?.replace(/\\r/g, '\n').replace(/\\n/g, '\n').trim();

  if (!normalizedKey || !normalizedKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Clé privée Google invalide ou manquante (BEGIN PRIVATE KEY absent)');
  }

  return new google.auth.JWT({
    email: DRIVESA_EMAIL,
    key: normalizedKey,
    // drive.file ne donne accès qu'aux fichiers créés par le SA ; pour un shared drive ou un fichier tiers, utiliser le scope complet
    scopes: ['https://www.googleapis.com/auth/drive']
  });
}

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
      const auth = buildDriveAuth();
      const drive = google.drive({ version: 'v3', auth });

      try {
        // Vérifier l'existence et l'accessibilité du fichier
        try {
          const fileInfo = await drive.files.get({
            fileId,
            supportsAllDrives: true,
            fields: 'id,name,owners,driveId'
          });
          console.log('Fichier trouvé:', fileInfo.data.name, 'drive:', fileInfo.data.driveId);
        } catch (getError) {
          // 404 : déjà supprimé ou lien invalide ; 403 : pas d'accès
          console.warn('Impossible de vérifier le fichier Drive:', getError.message);
        }

        // Supprimer le fichier de Google Drive
        try {
          await drive.files.delete({
            fileId,
            supportsAllDrives: true
          });
          console.log('Fichier supprimé de Drive:', fileId);
        } catch (deleteError) {
          const msg = deleteError?.errors?.[0]?.message || deleteError.message || '';
          if (msg.includes('File not found')) {
            console.warn('Fichier introuvable (peut-être déjà supprimé):', fileId);
          } else if (msg.includes('The user does not have sufficient permissions')) {
            console.error('Permissions insuffisantes pour supprimer le fichier Drive. Vérifiez que le service account est éditeur du drive/fichier. Détail:', msg);
            return json({
              error: 'Permissions Drive insuffisantes : le service account doit être éditeur du shared drive ou du fichier.'
            }, { status: 403 });
          } else {
            console.error('Erreur lors de la suppression du fichier Drive:', msg);
            throw deleteError;
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement Drive:', error);
        // On continue la suppression en base même si Drive échoue
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
