#!/usr/bin/env bash
# Idempotent bootstrap for the local modbusBlackBox Modbus TCP simulator.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log() { printf '\n[install] %s\n' "$*"; }

if [ ! -d "$REPO_ROOT/node_modules" ]; then
    log "Installing Node dependencies (npm install)"
    npm install
else
    log "node_modules already present"
fi

log "Install complete"
