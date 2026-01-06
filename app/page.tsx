"use client";

import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

import HeaderBanner from "../components/HeaderBanner";
import Footer from "../components/Footer";
import ScrollingDisclaimer from "../components/ScrollingDisclaimer";
import WalletCreateForm from "../components/WalletCreateForm";
import TransferForm from "../components/TransferForm";

type Wallet = {
  chainId: string;
  accountId: string;
  balance: string;
};

export default function Home() {
  const [wallet, setWallet] = useState<Wallet | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wallet");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [loadingBalance, setLoadingBalance] = useState(false);

  /* ---------- helpers ---------- */
  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  /* ---------- balance ---------- */
  const refreshBalance = async () => {
    if (!wallet) return;

    try {
      setLoadingBalance(true);

      const res = await fetch(process.env.NEXT_PUBLIC_BALANCE_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chainId: wallet.chainId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(
          data?.error ||
            "This chain is no longer active. Please clear wallet and create again."
        );
      }

      const updated = { ...wallet, balance: data.balance };
      setWallet(updated);
      localStorage.setItem("wallet", JSON.stringify(updated));
      toast.success("Balance updated");
    } catch (err: any) {
      toast.error(
        err.message ||
          "Chain is inactive. You can safely clear wallet and create a new one."
      );
    } finally {
      setLoadingBalance(false);
    }
  };

  /* ---------- wallet ---------- */
  const handleWalletCreate = (w: Wallet) => {
    setWallet(w);
    localStorage.setItem("wallet", JSON.stringify(w));
    toast.success("Wallet created");
  };

  const clearWallet = () => {
    if (!confirm("Clear wallet? This action cannot be undone.")) return;
    localStorage.removeItem("wallet");
    setWallet(null);
    toast.success("Wallet cleared");
  };

  return (
    <div className="max-w-md mx-auto mt-2 p-3 space-y-4">
      <Toaster position="top-right" />
      <HeaderBanner />

      {/* CREATE */}
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
        <>
          {/* WALLET CARD */}
          <div className="rounded-xl bg-gray-900 text-white p-4 space-y-3">
            <div className="space-y-2 text-xs break-all">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Chain ID</span>
                  <button
                    onClick={() => copy(wallet.chainId, "Chain ID")}
                    className="text-gray-300 hover:text-white"
                  >
                    📋
                  </button>
                </div>
                <p className="mt-1">{wallet.chainId}</p>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Public Key</span>
                  <button
                    onClick={() => copy(wallet.accountId, "Public Key")}
                    className="text-gray-300 hover:text-white"
                  >
                    📋
                  </button>
                </div>
                <p className="mt-1">{wallet.accountId}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-400">Balance</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-400">
                    {wallet.balance}
                  </span>
                  <button
                    onClick={refreshBalance}
                    disabled={loadingBalance}
                    className="text-gray-300 hover:text-white disabled:opacity-40"
                    title="Refresh balance"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={clearWallet}
              className="bg-red-500 text-white p-2 rounded"
            >
              Clear Wallet
            </button>

            <button
              onClick={() =>
                copy(JSON.stringify(wallet, null, 2), "Wallet backup")
              }
              className="bg-blue-500 text-white p-2 rounded"
            >
              Backup
            </button>
          </div>

          {/* MARKET */}
          <div className="pt-3">
            <Link href="/market">
              <button className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold">
                Launch BTC Prediction Market 🚀
              </button>
            </Link>
          </div>

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
              toast.success(`TX ${tx.amount} sent`);
            }}
          />
        </>
      )}

      <Footer />
      <ScrollingDisclaimer />
    </div>
  );
}
