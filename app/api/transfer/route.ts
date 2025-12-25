import { NextRequest, NextResponse } from "next/server";
import { runCommand } from "../../../lib/linera";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, from, to } = body;

    const result = await runCommand(`linera transfer ${amount} --from ${from} --to ${to}`);
    // update balance
    const balance = await runCommand(`linera query-balance ${from}`);

    return NextResponse.json({ result, balance });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
