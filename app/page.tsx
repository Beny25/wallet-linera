"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import HeaderBanner from "../components/HeaderBanner";
import Footer from "../components/Footer";
import ScrollingDisclaimer from "../components/ScrollingDisclaimer";
import WalletCreateForm from "../components/WalletCreateForm";
import TransferForm from "../components/TransferForm";

/* ================= TYPES ================= */

type Wallet = {
  chainId: string;
  accountId: string;
  balance: string;
  genesisHash?: string;
};

/* ================= PAGE ================= */

export default function Home() {
  const router = useRouter();

  /* ---------- MOUNT GUARD ---------- */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------- STATE ---------- */
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  /* ---------- LOAD WALLET (CLIENT ONLY) ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) {
      try {
        setWallet(JSON.parse(saved));
      } catch {
        console.error("Invalid wallet data");
        localStorage.removeItem("wallet");
      }
    }
  }, []);

  /* ---------- EARLY RETURN ---------- */
  if (!mounted) return null;


  /* -------- HELPERS -------- */

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const clearWallet = () => {
    localStorage.removeItem("wallet");
    setWallet(null);
  };

  const handleInactiveChain = () => {
    toast.error(
      "This chain is no longer active. You can safely clear your wallet and create a new one.",
      { duration: 4500 }
    );
    clearWallet();
  };

  /* -------- BALANCE -------- */

  const refreshBalance = async () => {
    if (!wallet || loadingBalance) return;
    setLoadingBalance(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BALANCE_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chainId: wallet.chainId }),
      });

      const data = await res.json();

      // chain inactive
      if (data.error === "CHAIN_NOT_ACTIVE") {
        handleInactiveChain();
        return;
      }

      // hard fail
      if (!res.ok || !data.balance) {
        throw new Error(data.error || "Balance unavailable");
      }

      // genesis reset
      if (wallet.genesisHash && wallet.genesisHash !== data.genesis_hash) {
        handleInactiveChain();
        return;
      }

      const updated: Wallet = {
        ...wallet,
        balance: data.balance,
        genesisHash: data.genesis_hash,
      };

      setWallet(updated);
      localStorage.setItem("wallet", JSON.stringify(updated));
      toast.success("Balance updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to refresh balance");
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleWalletCreate = (w: Wallet) => {
    setWallet(w);
    localStorage.setItem("wallet", JSON.stringify(w));
    toast.success("Wallet created");
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-md mx-auto mt-2 p-3 space-y-4">
      <Toaster position="top-right" />
      <HeaderBanner />

      {/* CREATE WALLET */}
      {!wallet && (
        <div className="bg-white rounded-xl shadow p-5 text-center">
          <h1 className="text-xl font-bold mb-2">ChainRitual Wallet</h1>
          <p className="text-gray-500 text-sm mb-4">
            Create your Linera wallet and start your ritual ✨
          </p>
          <WalletCreateForm onSuccess={handleWalletCreate} />
        </div>
      )}

      {/* WALLET */}
      {wallet && (
        <div className="space-y-4">
          {/* DARK WALLET CARD */}
          <div className="bg-neutral-900 text-white rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Balance</span>

              <button
                onClick={refreshBalance}
                disabled={loadingBalance}
                title="Refresh balance"
                className="text-gray-300 hover:text-white"
              >
                <svg
                  className={`w-4 h-4 ${
                    loadingBalance ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-7 9 9 0 00-9-9"
                  />
                </svg>
              </button>
            </div>

            <div className="text-3xl font-bold">
              {wallet.balance}{" "}
              <span className="text-sm text-gray-400">LINERA</span>
            </div>

            <div className="space-y-3 text-xs">
  {/* Chain ID */}
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-gray-400">Chain ID</span>
      <button
        onClick={() => copy(wallet.chainId, "Chain ID")}
        className="text-gray-300 hover:text-white"
        title="Copy Chain ID"
      >
        📋
      </button>
    </div>
    <div className="break-all text-gray-100">
      {wallet.chainId}
    </div>
  </div>

  {/* Public Key */}
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-gray-400">Public Key</span>
      <button
        onClick={() => copy(wallet.accountId, "Public Key")}
        className="text-gray-300 hover:text-white"
        title="Copy Public Key"
      >
        📋
      </button>
    </div>
    <div className="break-all text-gray-100">
      {wallet.accountId}
    </div>
  </div>
</div>

          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() =>
                copy(JSON.stringify(wallet, null, 2), "Wallet backup")
              }
              className="bg-blue-500 text-white p-2 rounded"
            >
              Backup
            </button>

            <button
              onClick={clearWallet}
              className="bg-red-500 text-white p-2 rounded"
            >
              Clear
            </button>
          </div>

          {/* MARKET */}
          <button
        onClick={() => router.push("/market")}
        className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold hover:bg-purple-700 transition"
        >
        Launch BTC Prediction Market
         </button>

          {/* TRANSFER */}
          <TransferForm
            walletAddress={wallet.chainId}
            balance={wallet.balance}
            onUpdateBalance={(bal) => {
              const updated = { ...wallet, balance: bal };
              setWallet(updated);
              localStorage.setItem("wallet", JSON.stringify(updated));
            }}
            onAddHistory={(tx) => {
              toast.success(`TX: ${tx.type} ${tx.amount} sent!`);
            }}
          />
        </div>
      )}

      <Footer />
      <ScrollingDisclaimer />
    </div>
  );
}
