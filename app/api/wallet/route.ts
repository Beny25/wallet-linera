import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

const runCommand = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout.trim());
    });
  });

export async function GET(req: NextRequest) {
  try {
    // contoh: create wallet + request-chain
    await runCommand(`linera wallet init --faucet http://localhost:8080`);
    const info = (await runCommand(`linera wallet request-chain --faucet http://localhost:8080`)).split(" ");
    return NextResponse.json({ chainId: info[0], accountId: info[1] });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
