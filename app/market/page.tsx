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

// GANTI INI DENGAN CHAIN ID MARKET KAMU YANG ASLI
const MARKET_CHAIN_ID = "0000000000000000000000000000000000000000000000000000000000000000"; 

export default function MarketPage() {
  const router = useRouter();

  /* ---------------- WALLET STATE ---------------- */
  const [wallet, setWallet] = useState<Wallet | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wallet");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  /* ---------------- MARKET STATE ---------------- */
  const [side, setSide] = useState<Side | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState<string | null>(null);

  /* ---------------- BTC PRICE FETCH ---------------- */
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Mengambil harga BTC dari API publik (Binance)
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT" );
        const data = await res.json();
        setBtcPrice(parseFloat(data.price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }));
      } catch (error) {
        console.error("Failed to fetch BTC price:", error);
        setBtcPrice("N/A");
      }
    };

    fetchPrice();
    // Update harga setiap 30 detik
    const interval = setInterval(fetchPrice, 30000); 
    return () => clearInterval(interval);
  }, []);

  /* ---------------- BET ---------------- */
  const placeBet = async () => {
    if (!wallet) {
      toast.error("Create wallet first");
      return;
    }

    if (!side || !amount) {
      toast.error("Select direction and amount");
      return;
    }
    
    const numericAmount = Number(amount);
    const numericBalance = Number(wallet.balance.replace(",", ""));

    if (numericAmount <= 0 || numericAmount > numericBalance) {
        toast.error("Invalid amount or insufficient balance");
        return;
    }

    try {
      setLoading(true);

      const res = await fetch(process.env.NEXT_PUBLIC_TRANSFER_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: wallet.chainId,
          to: MARKET_CHAIN_ID,
          amount: numericAmount,
          memo: side, // Tambahkan memo untuk backend (opsional)
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Transfer failed");
      }

      // UPDATE BALANCE REAL
      const updatedWallet = {
        ...wallet,
        balance: data.balance,
      };

      setWallet(updatedWallet);
      localStorage.setItem("wallet", JSON.stringify(updatedWallet));

      setAmount("");
      setSide(null);

      toast.success(`Bet placed successfully on ${side}! TX: ${data.txHash.substring(0, 8)}... 🚀`);
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
            <p className="text-xs text-gray-500">Current BTC/USDT Price</p>
            <p className="text-3xl font-extrabold text-gray-900">
                ${btcPrice || "Loading..."}
            </p>
        </div>

        {/* WALLET INFO */}
        <div className="bg-blue-50 rounded-xl p-3 text-sm space-y-1">
          <p>
            <span className="font-semibold text-blue-800">Your Chain ID:</span>{" "}
            <span className="break-all">{wallet?.chainId || "Not Connected"}</span>
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
            className={`flex-1 py-3 rounded-xl text-lg font-bold transition
              ${
                side === "UP"
                  ? "bg-green-600 text-white shadow-lg shadow-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            disabled={loading || !wallet}
          >
            📈 UP
          </button>

          <button
            onClick={() => setSide("DOWN")}
            className={`flex-1 py-3 rounded-xl text-lg font-bold transition
              ${
                side === "DOWN"
                  ? "bg-red-600 text-white shadow-lg shadow-red-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            disabled={loading || !wallet}
          >
            📉 DOWN
          </button>
        </div>

        {/* AMOUNT */}
        <input
          type="number"
          min="0"
          placeholder="Bet amount (in Linera Tokens)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-blue-500 focus:border-blue-500"
          disabled={loading || !wallet}
        />

        {/* SUBMIT */}
        <button
          onClick={placeBet}
          disabled={loading || !wallet || !side || !amount}
          className="w-full bg-black text-white py-3 rounded-xl text-lg font-bold disabled:opacity-50 transition duration-150"
        >
          {loading ? "Placing Bet..." : `Bet ${side || '...'} ${amount || '0'} Tokens`}
        </button>

        {/* FOOT NOTE */}
        <p className="text-center text-xs text-gray-500 pt-2">
          Your bet is a real on-chain transfer to the Market Chain ID.
        </p>
      </div>
    </div>
  );
}
