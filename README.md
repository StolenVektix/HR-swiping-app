# Missio — matching intérim

Application de matching entre employeurs et intérimaires, à base de swipe.

- **Espace employeur** : dépose des annonces (rémunération, temps de travail, période, localisation) et consulte les intérimaires qui ont matché.
- **Espace intérimaire** : définit ses critères de recherche, puis swipe les annonces (gauche = passer, droite = matcher).

Stack : React (Vite) + Python (FastAPI) + SQLite.

## Démarrer l'application

```bash
./start.sh
```

Ce script installe les dépendances si nécessaire, initialise la base avec des données de démo au premier lancement, puis démarre :

- Le frontend : http://localhost:5173
- Le backend (API + docs interactives) : http://localhost:8000/docs

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Employeur (Bordeaux) | employeur.bordeaux@demo.fr | demo1234 |
| Employeur (Paris) | employeur.paris@demo.fr | demo1234 |
| Intérimaire | interimaire@demo.fr | demo1234 |

## Arrêter l'application

```bash
./stop.sh
```

## Réinitialiser les données de démo

```bash
cd backend && source .venv/bin/activate && python -m app.seed
```

⚠️ Cette commande efface toutes les données existantes.
