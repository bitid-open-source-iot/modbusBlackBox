#!/usr/bin/env bash
# Reproducible runner for the modbusBlackBox mocha suite (Modbus TCP :5002).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log() { printf '\n[blackbox-test] %s\n' "$*"; }

tcp_open() {
    python3 - "$1" <<'PY'
import socket, sys
s = socket.socket()
s.settimeout(1)
try:
    s.connect(("127.0.0.1", int(sys.argv[1])))
    sys.exit(0)
except Exception:
    sys.exit(1)
finally:
    s.close()
PY
}

if ! tcp_open 5002; then
    echo "[blackbox-test] modbusBlackBox is not listening on :5002. Run: bash ../telemetry/.cursor/dev-all.sh" >&2
    exit 1
fi

log "Running mocha test/"
exec ./node_modules/.bin/mocha --timeout 10000 --exit test/testmodbus.js "$@"
