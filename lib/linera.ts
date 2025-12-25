import { exec } from "child_process";

export const runCommand = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout.trim());
    });
  });

export async function createWallet(faucetUrl: string) {
  await runCommand(`linera wallet init --faucet ${faucetUrl}`);
  const info = (await runCommand(`linera wallet request-chain --faucet ${faucetUrl}`)).split(" ");
  return {
    chainId: info[0],
    accountId: info[1],
  };
}

export async function queryBalance(address: string) {
  return await runCommand(`linera query-balance ${address}`);
}

export async function transfer(amount: number, from: string, to: string) {
  return await runCommand(`linera transfer ${amount} --from ${from} --to ${to}`);
}
