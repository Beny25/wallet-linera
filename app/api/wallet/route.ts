import { NextResponse } from "next/server";
import { runCommand } from "../../../lib/linera";

export async function POST() {
  try {
    const faucetUrl = process.env.NEXT_PUBLIC_FAUCET_URL;
    // init wallet
    await runCommand(`linera wallet init --faucet ${faucetUrl}`);
    // request chain
    const info = (await runCommand(`linera wallet request-chain --faucet ${faucetUrl}`)).split(" ");
    const chainId = info[0];
    const accountId = info[1];
    // query balance
    const balance = await runCommand(`linera query-balance ${chainId}:${accountId}`);

    return NextResponse.json({ chainId, accountId, balance });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
