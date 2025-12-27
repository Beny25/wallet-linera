import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to, amount } = body;

    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: "Missing from, to, or amount" },
        { status: 400 }
      );
    }

    // from format: chainId:accountId
    const fromChainId = from.split(":")[0];

    // ENV WALLET PATH (PASTIKAN ADA DI DOCKER)
    const walletPath = process.env.LINERA_WALLET;
    if (!walletPath) {
      throw new Error("LINERA_WALLET env not set");
    }

    /* =========================
       1️⃣ TRANSFER
    ========================= */
    const transferCmd = `
      linera transfer \
        --from ${fromChainId} \
        --to ${to} \
        ${amount}
    `;

    await execAsync(transferCmd);

    /* =========================
       2️⃣ QUERY BALANCE (CHAIN ONLY)
    ========================= */
    const balanceCmd = `
      linera --wallet ${walletPath} query-balance ${fromChainId}
    `;

    const { stdout } = await execAsync(balanceCmd);

    // stdout biasanya: "950.\n"
    const balance = stdout.trim();

    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (err: any) {
    console.error("TRANSFER ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Transfer failed" },
      { status: 500 }
    );
  }
}

