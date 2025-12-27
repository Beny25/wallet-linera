import { NextResponse } from "next/server";
import { runCommand, walletPath } from "../../../lib/linera";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chainId = url.searchParams.get("chainId");
    if (!chainId) throw new Error("chainId not provided");

    const balance = await runCommand(
      `linera --wallet ${walletPath} query-balance ${chainId}`
    );

    return NextResponse.json({ balance: balance.trim() });
  } catch (err: any) {
    console.error("API /balance error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

