#!/bin/bash
export LINERA_TMP_DIR=/root/.linera
mkdir -p "$LINERA_TMP_DIR"

export LINERA_WALLET="$LINERA_TMP_DIR/wallet.json"
export LINERA_KEYSTORE="$LINERA_TMP_DIR/keystore.json"
export LINERA_STORAGE="rocksdb:$LINERA_TMP_DIR/client.db"

linera net up --with-faucet --faucet-port 8080
