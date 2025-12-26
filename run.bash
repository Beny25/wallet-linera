#!/usr/bin/env bash
set -e

echo "==> Starting Linera localnet"

export LINERA_TMP_DIR=/root/.linera
mkdir -p "$LINERA_TMP_DIR"

export LINERA_WALLET="$LINERA_TMP_DIR/wallet.json"
export LINERA_KEYSTORE="$LINERA_TMP_DIR/keystore.json"
export LINERA_STORAGE="rocksdb:$LINERA_TMP_DIR/client.db"

# Load helper (INI PENTING)
eval "$(linera net helper)"

# Jalankan localnet + faucet (linera_spawn auto-manage process)
linera_spawn linera net up --with-faucet --faucet-port 8080

export LINERA_FAUCET_URL=http://localhost:8080

# Init wallet (idempotent)
if [ ! -f "$LINERA_WALLET" ]; then
  linera wallet init --faucet "$LINERA_FAUCET_URL"
  linera wallet request-chain --faucet "$LINERA_FAUCET_URL"
fi

echo "==> Linera localnet ready"
echo "==> Faucet: $LINERA_FAUCET_URL"

echo "==> Starting frontend on :5173"
echo "NODE_ENV=$NODE_ENV"

pnpm install
pnpm build
pnpm start
<<<<<<< HEAD
=======


>>>>>>> 86d35628 (Merge updates from GitHub)
