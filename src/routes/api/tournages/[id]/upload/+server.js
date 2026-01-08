import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { google } from 'googleapis';
import { DRIVESA_EMAIL, DRIVESA_PRIVATE_KEY } from '$env/static/private';
import { Readable } from 'stream';

export const POST = async ({ request, params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = params;

  try {
    // Récupérer les infos du tournage
    const [rows] = await db.query('SELECT drive FROM tournages WHERE id = ?', [id]);
    
    if (!rows || rows.length === 0) {
      return json({ error: 'Tournage non trouvé' }, { status: 404 });
    }

    const tournage = rows[0];
    
    if (!tournage.drive) {
      return json({ error: 'Aucun dossier Drive configuré pour ce tournage' }, { status: 400 });
    }

    // Récupérer le fichier uploadé
    const formData = await request.formData();
    const file = formData.get('files');

    if (!file) {
      return json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Extraire l'ID du dossier depuis l'URL Drive
    // Format: https://drive.google.com/drive/folders/ID ou https://drive.google.com/drive/u/0/folders/ID
    const folderIdMatch = tournage.drive.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (!folderIdMatch) {
      return json({ error: 'Format d\'URL Drive invalide' }, { status: 400 });
    }
    const folderId = folderIdMatch[1];

    // Configurer l'authentification Google Drive
    const auth = new google.auth.JWT({
      email: DRIVESA_EMAIL,
      key: DRIVESA_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Convertir le fichier en buffer puis en stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Upload vers Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId]
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: stream
      },
      fields: 'id, name, webViewLink',
    supportsAllDrives: true,
    });

    const fileId = response.data.id;

    // Partager le fichier en lecture pour tout le monde
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      },
      supportsAllDrives: true
    });

    console.log('Upload réussi vers Google Drive:', {
      filename: file.name,
      fileId: fileId,
      size: file.size,
      shared: 'public (reader)'
    });

    // Mettre à jour le passage de l'utilisateur : lien de rendu + statut submitted
    await db.query(
      'UPDATE passage SET rendu = ?, status = ? WHERE tournages_id = ? AND discord_id = ?',
      [response.data.webViewLink, 'submitted', id, locals.user.discord_id]
    );

    return json({ 
      success: true, 
      message: 'Fichier uploadé avec succès',
      fileId: fileId,
      fileName: response.data.name,
      fileUrl: response.data.webViewLink,
      status: 'submitted'
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    return json({ error: 'Erreur serveur: ' + error.message }, { status: 500 });
  }
};
