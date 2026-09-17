#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

stop_port() {
  local port="$1"
  local name="$2"
  local pids
  pids="$(lsof -ti:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "$pids" | xargs -r kill -TERM 2>/dev/null
    sleep 1
    pids="$(lsof -ti:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    [ -n "$pids" ] && echo "$pids" | xargs -r kill -9 2>/dev/null
    echo "$name arrêté (port $port libéré)."
  else
    echo "$name n'était pas en cours d'exécution (port $port libre)."
  fi
}

# uvicorn --reload et npm/vite forkent des processus enfants dont le PID capturé
# au démarrage ne correspond pas toujours au process qui écoute réellement le port.
# On arrête donc par port, ce qui est fiable quel que soit le nombre de sous-process.
stop_port 8000 "Backend"
stop_port 5173 "Frontend"

# Nettoyage des éventuels processus superviseurs restants (ex: reloader uvicorn)
pkill -f "backend/.venv/bin/uvicorn" 2>/dev/null || true
pkill -f "frontend/node_modules/.bin/vite" 2>/dev/null || true

rm -f "$ROOT_DIR/.backend.pid" "$ROOT_DIR/.frontend.pid"
