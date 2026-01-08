import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

// PATCH - Mettre à jour un tournage (nom, brief et/ou form)
export const PATCH = async ({ request, params, locals }) => {
  // Vérification admin
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    return json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = params;
  const payload = await request.json();
  const name = typeof payload.name === 'string' ? payload.name.trim() : undefined;
  const brief = typeof payload.brief === 'string' ? payload.brief : undefined;
  const form = typeof payload.form === 'string' ? payload.form : undefined;
  const drive = typeof payload.drive === 'string' ? payload.drive : undefined;

  if ((name === undefined || name === '') && brief === undefined && form === undefined && drive === undefined) {
    return json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    if (name === '') {
      return json({ error: 'Le nom du tournage est requis' }, { status: 400 });
    }
    fields.push('name = ?');
    values.push(name);
  }

  if (brief !== undefined) {
    fields.push('brief = ?');
    values.push(brief);
  }

  if (form !== undefined) {
    fields.push('form = ?');
    values.push(form);
  }

  if (drive !== undefined) {
    fields.push('drive = ?');
    values.push(drive);
  }

  values.push(id);

  try {
    await db.query(`UPDATE tournages SET ${fields.join(', ')} WHERE id = ?`, values);

    return json({ success: true, name, brief, form, drive });
  } catch (error) {
    console.error('Erreur modification tournage:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};

// DELETE - Supprimer un tournage (optionnel)
export const DELETE = async ({ params, locals }) => {
  // Vérification admin
  if (!locals.user || locals.user.rank !== 'Administrateur') {
    return json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = params;

  try {
    await db.query('DELETE FROM tournages WHERE id = ?', [id]);
    return json({ success: true });
  } catch (error) {
    console.error('Erreur suppression tournage:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};
