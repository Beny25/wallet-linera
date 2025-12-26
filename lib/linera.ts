import "server-only";
import { exec } from "child_process";

const WALLET_PATH = process.env.LINERA_WALLET || "/root/.linera/wallet.json";

export const runCommand = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(cmd, { env: { ...process.env, WALLET_PATH } }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout.trim());
    });
  });

export const walletPath = WALLET_PATH;

