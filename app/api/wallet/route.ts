import { NextResponse } from "next/server";
import { runCommand, walletPath } from "../../../lib/linera";
import fs from "fs";

export async function POST() {
  try {
    const faucetUrl = process.env.NEXT_PUBLIC_FAUCET_URL;
    if (!faucetUrl) throw new Error("FAUCET_URL not set");

    // init wallet hanya jika belum ada
    if (!fs.existsSync(walletPath)) {
      await runCommand(`linera --wallet ${walletPath} wallet init --faucet ${faucetUrl}`);
    }

    // request chain
    const output = await runCommand(
      `linera --wallet ${walletPath} wallet request-chain --faucet ${faucetUrl}`
    );

    const [chainId, accountId] = output.trim().split(/\s+/);

    // query balance
    const balance = await runCommand(
      `linera --wallet ${walletPath} query-balance ${chainId}`
    );

    return NextResponse.json({ chainId, accountId, balance });
  } catch (err: any) {
    console.error("API /wallet error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

