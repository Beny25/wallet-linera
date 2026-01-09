// app/market/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

type Wallet = {
  chainId: string;
  accountId: string;
  balance: string;
};

type Side = "UP" | "DOWN";

type BetState = {
  side: Side;
  amount: string;
  entryPrice: number;
  expiresAt: number;
};

const BET_DURATION = 60; // seconds

export default function MarketPage() {
  const router = useRouter();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [amount, setAmount] = useState("");

  const [bet, setBet] = useState<BetState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [result, setResult] = useState<"WIN" | "LOSE" | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD WALLET ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) setWallet(JSON.parse(saved));

    const betSaved = localStorage.getItem("activeBet");
    if (betSaved) setBet(JSON.parse(betSaved));
  }, []);

  /* ---------------- BTC PRICE ---------------- */
  const fetchPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const data = await res.json();
      setBtcPrice(data.bitcoin.usd);
    } catch {}
  };

  useEffect(() => {
    fetchPrice();
    const i = setInterval(fetchPrice, 10_000);
    return () => clearInterval(i);
  }, []);

  /* ---------------- COUNTDOWN ---------------- */
  useEffect(() => {
    if (!bet) return;

    const interval = setInterval(() => {
      const left = Math.max(
        0,
        Math.floor((bet.expiresAt - Date.now()) / 1000)
      );
      setTimeLeft(left);

      if (left === 0) {
        clearInterval(interval);
        resolveBet();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bet]);

  /* ---------------- PLACE BET ---------------- */
  const placeBet = async () => {
    if (!wallet || !side || !amount || !btcPrice) return;

    try {
      setLoading(true);

      const res = await fetch(process.env.NEXT_PUBLIC_BET_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: wallet.chainId,
          side,
          amount,
        }),
      });

      if (!res.ok) throw new Error("Bet failed");

      const expiresAt = Date.now() + BET_DURATION * 1000;

      const betData: BetState = {
        side,
        amount,
        entryPrice: btcPrice,
        expiresAt,
      };

      setBet(betData);
      localStorage.setItem("activeBet", JSON.stringify(betData));
      toast.success("Bet placed 🚀");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESOLVE ---------------- */
  const resolveBet = () => {
    if (!bet || !btcPrice) return;

    const win =
      (bet.side === "UP" && btcPrice > bet.entryPrice) ||
      (bet.side === "DOWN" && btcPrice < bet.entryPrice);

    setResult(win ? "WIN" : "LOSE");
    localStorage.removeItem("activeBet");

    toast(win ? "🎉 YOU WIN!" : "😭 YOU LOSE");
  };

  /* ---------------- CLAIM ---------------- */
  const claim = async () => {
    if (!wallet) return;

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_CLAIM_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: wallet.chainId,
        }),
      });

      const data = await res.json();
      setWallet({ ...wallet, balance: data.balance });
      localStorage.setItem(
        "wallet",
        JSON.stringify({ ...wallet, balance: data.balance })
      );

      toast.success("Reward claimed 💰");
    } catch {
      toast.error("Claim failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster />
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow space-y-4">

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">BTC Prediction</h1>
          <button onClick={() => router.push("/")} className="text-blue-600 text-sm">
            ← Wallet
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">BTC / USD</p>
          <p className="text-3xl font-extrabold">
            ${btcPrice?.toLocaleString() ?? "..."}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 text-sm">
          <p className="break-all">
            <b>Chain:</b> {wallet?.chainId ?? "-"}
          </p>
          <p>
            <b>Balance:</b>{" "}
            <span className="text-green-600 font-bold">
              {wallet?.balance ?? "0"}
            </span>
          </p>
        </div>

        {!bet && (
          <>
            <div className="flex gap-3">
              {(["UP", "DOWN"] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 py-3 rounded-xl font-bold ${
                    side === s
                      ? s === "UP"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {s === "UP" ? "📈 UP" : "📉 DOWN"}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />

            <button
              onClick={placeBet}
              disabled={loading || !side || !amount}
              className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              Place Bet
            </button>
          </>
        )}

        {bet && timeLeft !== null && timeLeft > 0 && (
          <div className="text-center font-bold text-orange-600">
            ⏳ Resolving in {timeLeft}s
          </div>
        )}

        {result && (
          <div className="text-center space-y-3">
            <p
              className={`text-2xl font-extrabold ${
                result === "WIN" ? "text-green-600" : "text-red-600"
              }`}
            >
              {result === "WIN" ? "🎉 YOU WIN!" : "😭 YOU LOSE"}
            </p>

            {result === "WIN" && (
              <button
                onClick={claim}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
              >
                Claim Reward
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
