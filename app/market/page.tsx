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

const MARKET_CHAIN_ID =
  "f871bc86b3fc1fbdb0e5a7aa505f974fa0468878606edef8683fdd2489f8c8db";

export default function MarketPage() {
  const router = useRouter();

  /* ---------------- CLIENT MOUNT ---------------- */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------- STATE ---------------- */
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [amount, setAmount] = useState("");
  const [btcPrice, setBtcPrice] = useState("Loading...");

  /* ---------------- LOAD WALLET (CLIENT ONLY) ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) {
      try {
        setWallet(JSON.parse(saved));
      } catch {
        console.error("Invalid wallet in localStorage");
      }
    }
  }, []);

  /* ---------------- BTC PRICE FETCH ---------------- */
  useEffect(() => {
    let alive = true;

    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await res.json();
        const price = Number(data.bitcoin.usd).toFixed(2);

        if (alive) {
          setBtcPrice(price);
          localStorage.setItem("btcPrice", price);
        }
      } catch {
        const last = localStorage.getItem("btcPrice");
        if (last && alive) setBtcPrice(last);
      }
    };

    fetchPrice();
    const id = setInterval(fetchPrice, 10000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  /* ---------------- PLACE BET (DEV MODE) ---------------- */
  const placeBet = async () => {
    toast("⚠️ Sorry! This feature is under development.", {
      style: { background: "#333", color: "#fff" },
    });
  };

  /* ---------------- EARLY RETURN (NO SSR MISMATCH) ---------------- */
  if (!mounted) return null;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-3">
          <h1 className="text-xl font-bold text-gray-800">
            BTC Prediction Market
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Wallet
          </button>
        </div>

        {/* BTC PRICE */}
        <div className="text-center">
          <p className="text-xs text-gray-500">Current BTC/USD Price</p>
          <p className="text-3xl font-extrabold text-gray-900">
            ${btcPrice}
          </p>
        </div>

        {/* WALLET INFO */}
        <div className="bg-blue-50 rounded-xl p-3 text-sm space-y-1">
          <p>
            <span className="font-semibold text-blue-800">Your Chain ID:</span>{" "}
            <span className="break-all">
              {wallet?.chainId || "Not Connected"}
            </span>
          </p>
          <p>
            <span className="font-semibold text-blue-800">Balance:</span>{" "}
            <span className="text-green-600 font-extrabold">
              {wallet?.balance ?? "0.0"}
            </span>
          </p>
        </div>

        {/* SIDE SELECT */}
        <div className="flex gap-3">
          <button
            onClick={() => setSide("UP")}
            disabled={!wallet}
            className={`flex-1 py-3 rounded-xl text-lg font-bold transition ${
              side === "UP"
                ? "bg-green-600 text-white shadow-lg shadow-green-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📈 UP
          </button>

          <button
            onClick={() => setSide("DOWN")}
            disabled={!wallet}
            className={`flex-1 py-3 rounded-xl text-lg font-bold transition ${
              side === "DOWN"
                ? "bg-red-600 text-white shadow-lg shadow-red-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📉 DOWN
          </button>
        </div>

        {/* AMOUNT INPUT */}
        <input
          type="number"
          min="0"
          placeholder="Bet amount (in Linera Tokens)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!wallet}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-blue-500 focus:border-blue-500"
        />

        {/* PLACE BET */}
        <button
          onClick={placeBet}
          disabled={!wallet || !side || !amount}
          className="w-full bg-black text-white py-3 rounded-xl text-lg font-bold disabled:opacity-50 transition"
        >
          {`Bet ${side || "..."} ${amount || "0"} Tokens`}
        </button>

        <p className="text-center text-xs text-gray-500 pt-2">
          Your bet is a real on-chain transfer to the Market Chain ID.
        </p>
      </div>
    </div>
  );
}
