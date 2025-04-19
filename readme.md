# IA4Nieup - Plateforme d'Apprentissage en IA

## Prérequis

- Node.js >= 18.0.0
- MongoDB >= 6.0.0
- npm ou yarn

## Installation

1. Cloner le projet et installer les dépendances frontend :

```bash
npm install
```

2. Installer les dépendances backend :

```bash
cd server && npm install
```

## Configuration

1. Créer un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/ucad_ia
JWT_SECRET=ucad_ia_super_secret_key_2025
PORT=5000
```

## Peuplement de la base de données

1. Assurez-vous que MongoDB est en cours d'exécution sur votre machine

2. Exécutez le script de peuplement :

```bash
cd server
node src/scripts/populateInitialData.js
```

Ce script va créer :

- Des utilisateurs de test (student@ucad.edu.sn / Student123!, admin@ucad.edu.sn / Admin123!)
- Des objectifs d'apprentissage
- Des évaluations
- Des quiz
- Un parcours exemple

## Lancement des serveurs

1. Démarrer le serveur backend (depuis le dossier racine) :

```bash
npm run server
```

2. Dans un nouveau terminal, démarrer le serveur frontend :

```bash
npm run dev
```

## Accès à l'application

- Frontend : http://localhost:5173
- Backend API : http://localhost:5000

## Comptes de test

1. Compte étudiant :

   - Email : student@ucad.edu.sn
   - Mot de passe : Student123!

2. Compte administrateur :
   - Email : admin@ucad.edu.sn
   - Mot de passe : Admin123!

## Structure du projet

```
.
├── src/                  # Code source frontend (React)
├── server/              # Code source backend (Node.js)
│   ├── src/
│   │   ├── models/     # Modèles MongoDB
│   │   ├── routes/     # Routes API
│   │   ├── scripts/    # Scripts utilitaires
│   │   └── utils/      # Utilitaires
│   └── index.js        # Point d'entrée du serveur
└── package.json        # Configuration du projet
```
