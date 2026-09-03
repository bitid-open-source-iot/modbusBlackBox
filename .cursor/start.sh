#!/usr/bin/env bash
# No per-boot infrastructure. The Node process is started from
# telemetry/.cursor/dev-all.sh so logs stay visible.
set -euo pipefail
echo "[start] modbusBlackBox ready (listens on TCP 5002 when node index.js runs)"
