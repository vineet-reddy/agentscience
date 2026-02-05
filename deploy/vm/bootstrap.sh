#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/vm/bootstrap.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y \
  git curl ca-certificates build-essential \
  python3 python3-venv python3-pip

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

mkdir -p /opt/agentscience
chown -R "$SUDO_USER":"$SUDO_USER" /opt/agentscience || true

echo "Bootstrap complete. Next: copy repo to /opt/agentscience and follow deploy/runbook.md"
