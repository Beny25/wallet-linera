"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

type Wallet = {
  chainId: string;
  accountId: string;
  balance: string;
};

type Side = "UP" | "DOWN";

// ⚠️ UNTUK TEST AMAN
// ganti ke chain market asli kalau sudah ada
const MARKET_CHAIN_ID_FALLBACK = "";

export default function MarketPage() {
  const router = useRouter();

  /* ---------------- WALLET ---------------- */
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) setWallet(JSON.parse(saved));
  }, []);

  /* ---------------- MARKET STATE ---------------- */
  const [side, setSide] = useState<Side | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState<string>("Loading...");

  /* ---------------- BTC PRICE ---------------- */
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );
        const data = await res.json();
        setBtcPrice(
          parseFloat(data.price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      } catch {
        setBtcPrice("N/A");
      }
    };

    fetchPrice();
    const i = setInterval(fetchPrice, 30000);
    return () => clearInterval(i);
  }, []);

  /* ---------------- PLACE BET ---------------- */
  const placeBet = async () => {
    if (!wallet) {
      toast.error("Wallet not found");
      return;
    }

    if (!side || !amount) {
      toast.error("Select direction & amount");
      return;
    }

    const numericAmount = Number(amount);
    const balance = Number(wallet.balance.replace(/,/g, ""));

    if (numericAmount <= 0 || numericAmount > balance) {
      toast.error("Invalid amount / insufficient balance");
      return;
    }

    const marketChainId =
      MARKET_CHAIN_ID_FALLBACK || wallet.chainId; // fallback test aman

    try {
      setLoading(true);

      const res = await fetch(process.env.NEXT_PUBLIC_TRANSFER_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: wallet.chainId,
          to: marketChainId,
          amount: numericAmount,
          memo: side,
        }),
      });

      // ✅ SAFE RESPONSE PARSE
      const raw = await res.text();
      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        console.error("RAW RESPONSE:", raw);
        throw new Error("Invalid server response");
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || "Transfer failed");
      }

      if (!data.balance) {
        throw new Error("Balance not returned from backend");
      }

      const updatedWallet = {
        ...wallet,
        balance: data.balance,
      };

      setWallet(updatedWallet);
      localStorage.setItem("wallet", JSON.stringify(updatedWallet));

      setAmount("");
      setSide(null);

      toast.success(`Bet ${side} success 🚀`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3">
          <h1 className="text-xl font-bold">BTC Prediction Market</h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* PRICE */}
        <div className="text-center">
          <p className="text-xs text-gray-500">BTC / USDT</p>
          <p className="text-3xl font-extrabold">${btcPrice}</p>
        </div>

        {/* WALLET */}
        <div className="bg-blue-50 rounded-xl p-3 text-sm space-y-1">
          <p>
            <span className="font-semibold">Chain ID:</span>{" "}
            <span className="break-all">
              {wallet?.chainId || "Not connected"}
            </span>
          </p>
          <p>
            <span className="font-semibold">Balance:</span>{" "}
            <span className="text-green-600 font-bold">
              {wallet?.balance || "0"}
            </span>
          </p>
        </div>

        {/* SIDE */}
        <div className="flex gap-3">
          <button
            onClick={() => setSide("UP")}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold ${
              side === "UP"
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            📈 UP
          </button>

          <button
            onClick={() => setSide("DOWN")}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold ${
              side === "DOWN"
                ? "bg-red-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            📉 DOWN
          </button>
        </div>

        {/* AMOUNT */}
        <input
          type="number"
          min="0"
          placeholder="Bet amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
          className="w-full border rounded-xl px-4 py-3"
        />

        {/* SUBMIT */}
        <button
          onClick={placeBet}
          disabled={loading || !side || !amount}
          className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "Processing..." : `Bet ${side ?? ""}`}
        </button>

        <p className="text-xs text-center text-gray-500">
          On-chain transfer to market chain
        </p>
      </div>
    </div>
  );
}
