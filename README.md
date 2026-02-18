
# WeDev

WeDev est une application web full‑stack basée sur SvelteKit, conçue pour gérer des tournages et des utilisateurs. Le projet utilise Svelte + SvelteKit côté serveur, avec une organisation modulaire des routes et des composants.

**Objectif**

Fournir une interface d'administration pour créer, suivre et gérer des tournages, leurs rendus et utilisateurs.

**Caractéristiques principales**

- **Gestion de tournages** : création, édition, archivage et upload de rendus.
- **Authentification** : intégration OAuth (ex. Discord) pour la connexion.
- **Tableau de bord** : cartes réutilisables et composants UI modulaires (Tabler CSS).
- **API REST interne** via les routes SvelteKit dans `src/routes/api`.

**Stack technique**

- Frontend & serveur : SvelteKit
- UI : Tabler (CSS) + composants Svelte
- Base de données / utilitaires serveur : `src/lib/server/db.js`
- Outils : Vite, npm

**Installation (local)**

Prérequis : Node.js 18+ recommandé.

1. Cloner le dépôt

```bash
git clone https://github.com/Margouta/WeDev.git
cd WeDev
```

2. Installer les dépendances

```bash
npm install
```

3. Variables d'environnement

Copiez `.env.example` en `.env` (s'il existe) et ajustez les variables nécessaires : clés OAuth, chaîne de connexion DB, etc.

```bash
cp .env.example .env
# puis éditez .env
```

Si le projet utilise SQLite/Postgres/MariaDB, configurez la chaîne de connexion dans `.env` et vérifiez `src/lib/server/db.js`.

**Commandes utiles**

- Démarrage en développement :

```bash
npm run dev
```

- Build de production :

```bash
npm run build
```

- Prévisualiser la build produite :

```bash
npm run preview
```

**Structure du projet (extraits)**

- `src/routes/` : routes SvelteKit (pages, API). Voir en particulier `src/routes/api/tournages` pour les endpoints tournage.
- `src/lib/components/` : composants réutilisables (dashboard, cartes, uploader).
- `src/lib/server/db.js` : connexion et requêtes vers la base de données.
- `src/stores/` : magasins Svelte pour l'état global (ex. thème).
- `static/` : fichiers statiques (robots.txt, images publiques).

Exemple de fichiers importants :

- [src/routes/+layout.svelte](src/routes/+layout.svelte) : layout racine.
- [src/routes/dashboard/+page.svelte](src/routes/dashboard/+page.svelte) : page dashboard.
- [src/lib/components/dashboard/WelcomeCard.svelte](src/lib/components/dashboard/WelcomeCard.svelte) : exemple de carte.

**Notes pour les développeurs**

- Respectez les conventions du projet : composants Svelte petits et réutilisables, logique serveur dans `+server.js` / `+page.server.js`.
- Utilisez les stores pour l'état partagé et préférez les actions de formulaire côté serveur pour la persistance.
- Évitez d'exposer des secrets côté client.

**Tests & qualité**

Ajoutez des tests unitaires si nécessaire et utilisez les outils de lint/format du projet (s'il y en a). Commandes éventuelles :

```bash
npm run lint
npm run format
```

**Déploiement**

Pour déployer, choisissez un adapter SvelteKit adapté à votre cible (Vercel, Netlify, Node, etc.). Voir la documentation SvelteKit pour configurer un adapter dans `svelte.config.js`.

Étapes générales :

1. Construire : `npm run build`
2. Déployer le dossier `build` / adapter selon l'environnement
3. Configurer les variables d'environnement et la base de données en production

**Contribuer**

Les contributions sont bienvenues : ouvrez une issue pour discuter des changements majeurs, puis soumettez une pull request avec une description claire.

**Licence**

Ce projet inclut un fichier `LICENSE` à la racine ; consultez-le pour les détails de la licence.