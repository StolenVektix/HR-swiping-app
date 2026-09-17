#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

port_in_use() {
  lsof -ti:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

if port_in_use 8000; then
  echo "Le backend tourne déjà sur le port 8000."
else
  echo "==> Préparation du backend..."
  if [ ! -d "$BACKEND_DIR/.venv" ]; then
    if ! python3 -m venv "$BACKEND_DIR/.venv" 2>/tmp/missio_venv_err.log; then
      echo "python3 -m venv indisponible (pip/ensurepip manquant), utilisation de virtualenv..."
      export PATH="$HOME/.local/bin:$PATH"
      python3 -m pip --version >/dev/null 2>&1 || \
        (curl -sL https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py && \
         python3 /tmp/get-pip.py --user --break-system-packages -q)
      python3 -m pip install --user --break-system-packages -q virtualenv 2>/dev/null || \
        python3 -m pip install --user -q virtualenv
      python3 -m virtualenv -q "$BACKEND_DIR/.venv"
    fi
  fi
  # shellcheck disable=SC1091
  source "$BACKEND_DIR/.venv/bin/activate"
  pip install -q -r "$BACKEND_DIR/requirements.txt"

  if [ ! -f "$BACKEND_DIR/interim.db" ]; then
    echo "==> Initialisation de la base avec les données de démo..."
    (cd "$BACKEND_DIR" && python -m app.seed)
  fi

  echo "==> Démarrage du backend (FastAPI) sur http://localhost:8000 ..."
  (cd "$BACKEND_DIR" && setsid nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload \
    > "$BACKEND_DIR/backend.log" 2>&1 & echo $! > "$ROOT_DIR/.backend.pid")
  deactivate
fi

if port_in_use 5173; then
  echo "Le frontend tourne déjà sur le port 5173."
else
  echo "==> Préparation du frontend..."
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    (cd "$FRONTEND_DIR" && npm install)
  fi

  echo "==> Démarrage du frontend (Vite) sur http://localhost:5173 ..."
  (cd "$FRONTEND_DIR" && setsid nohup node_modules/.bin/vite --host \
    > "$FRONTEND_DIR/frontend.log" 2>&1 & echo $! > "$ROOT_DIR/.frontend.pid")
fi

echo "==> Attente de la disponibilité des serveurs..."
for i in $(seq 1 30); do
  port_in_use 8000 && port_in_use 5173 && break
  sleep 1
done

echo ""
echo "Missio est prêt :"
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8000 (docs sur /docs)"
echo ""
echo "Comptes de démo :"
echo "  Employeur Bordeaux : employeur.bordeaux@demo.fr / demo1234"
echo "  Employeur Paris    : employeur.paris@demo.fr / demo1234"
echo "  Intérimaire        : interimaire@demo.fr / demo1234"
echo ""
echo "Pour arrêter : ./stop.sh"
