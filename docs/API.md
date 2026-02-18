# Guide d'API — WeDev

Ce document décrit les endpoints exposés par l'API interne du projet (routes SvelteKit situées dans `src/routes/api`). Les exemples sont fournis en `curl` et `fetch` et doivent être adaptés à votre configuration d'authentification (cookies/session ou token).

## Authentification

L'application utilise l'authentification via OAuth (ex. Discord) pour les utilisateurs. Les endpoints d'API attendent généralement une session valide (cookie) ou un header `Authorization: Bearer <token>` si vous avez exposé un token.

## Endpoints principaux

Note : adaptez l'URL de base (`http://localhost:5173`) selon votre `PORT`.

- GET `/api/tournages` — liste des tournages
  - Réponse : `200` JSON array

  Exemple curl :

  ```bash
  curl -v http://localhost:5173/api/tournages
  ```

- POST `/api/tournages` — créer un tournage
  - Corps : JSON (ex. `title`, `date`, `lieu`, `cgu`)
  - Réponse : `201` JSON avec l'objet créé

  Exemple fetch :

  ```js
  await fetch('/api/tournages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Tournage X', date: '2026-02-20' })
  })
  ```

- GET `/api/tournages/[id]` — récupérer un tournage
  - Réponse : `200` JSON ou `404` si introuvable

- PUT/PATCH `/api/tournages/[id]` — mettre à jour un tournage
  - Corps : JSON des champs à mettre à jour
  - Réponse : `200` JSON objet mis à jour

- DELETE `/api/tournages/[id]` — supprimer un tournage
  - Réponse : `204` (aucun contenu) ou `200` selon implémentation

- POST `/api/tournages/[id]/upload` — uploader un rendu (fichier)
  - Type : `multipart/form-data` (champ `file` ou selon implémentation)
  - Réponse : `200` ou `201` avec métadonnées du fichier

  Exemple curl :

  ```bash
  curl -F "file=@/chemin/vers/fichier.mp4" \
    http://localhost:5173/api/tournages/123/upload
  ```

- POST `/api/tournages/[id]/archive` — archiver un tournage
  - Réponse : `200` avec nouvel état

- POST `/api/tournages/[id]/delete-rendu` — suppression d'un rendu
  - Corps : JSON `{ renduId: '...' }` ou paramètres/form-data selon l'implémentation

- GET `/api/users/[id]` — récupérer les infos d'un utilisateur
  - Réponse : `200` JSON


## En-têtes et codes de statut

- Les réponses sont typiquement en `application/json`.
- Codes usuels : `200` OK, `201` Créé, `204` No Content, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `500` Erreur serveur.

## Bonnes pratiques

- Toujours valider et sanitiser les données côté serveur (`+server.js`, `+page.server.js`).
- Utiliser `multipart/form-data` pour les uploads et limiter la taille côté serveur.
- Protéger les endpoints sensibles avec contrôle d'accès (session, rôle).

## Debug & tests

- Pendant le développement, utilisez `npm run dev` et testez les endpoints avec `curl`, `httpie` ou Postman.
- Pour les uploads depuis un formulaire Svelte, vérifiez les actions de formulaire côté serveur dans les fichiers `+server.js` correspondants.

## Fichiers utiles dans le projet

- API tournages : [src/routes/api/tournages](src/routes/api/tournages)
- Endpoints individuels (id, archive, upload) : [src/routes/api/tournages/[id]](src/routes/api/tournages/[id])

Si vous souhaitez, je peux générer un collection Postman/Insomnia ou ajouter des exemples d'appels en TypeScript/JS plus complets.
