"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

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
  /* ---------------- STATE ---------------- */
  const [wallet, setWallet] = useState<Wallet | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wallet");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [loadingBalance, setLoadingBalance] = useState(false);

  /* ---------------- CLIPBOARD ---------------- */
  const copy = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!ok) throw new Error("copy failed");
      }

      toast.success(`${label} copied 📋`);
      navigator.vibrate?.(30);
    } catch {
      toast.error("Copy failed");
    }
  };

  /* ---------------- BALANCE ---------------- */
  const refreshBalance = async () => {
    if (!wallet) return;
    try {
      setLoadingBalance(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BALANCE_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chainId: wallet.chainId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const updated = { ...wallet, balance: data.balance };
      setWallet(updated);
      localStorage.setItem("wallet", JSON.stringify(updated));
      toast.success("Balance updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh balance");
    } finally {
      setLoadingBalance(false);
    }
  };

  /* ---------------- WALLET ---------------- */
  const handleWalletCreate = (w: Wallet) => {
    setWallet(w);
    localStorage.setItem("wallet", JSON.stringify(w));
    toast.success("Wallet created");
  };

  const backupWallet = () => {
    if (!wallet) return;
    copy(JSON.stringify(wallet, null, 2), "Wallet");
  };

  const clearWallet = () => {
    const ok = window.confirm(
      "Are you sure you want to clear this wallet?\n\nThis action cannot be undone."
    );
    if (!ok) return;

    localStorage.removeItem("wallet");
    setWallet(null);
    toast.success("Wallet cleared");
  };

  /* ---------------- UI ---------------- */
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
          <WalletCreateForm setWallet={handleWalletCreate} />
        </div>
      )}

      {/* WALLET */}
      {wallet && (
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          {/* INFO */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2 break-all">
            <div className="flex justify-between">
              <span className="font-semibold">Chain ID</span>
              <button
                onClick={() => copy(wallet.chainId, "Chain ID")}
                className="text-blue-600 text-[10px]"
              >
                Copy
              </button>
            </div>
            <p>{wallet.chainId}</p>

            <div className="flex justify-between pt-1">
              <span className="font-semibold">Account ID</span>
              <button
                onClick={() => copy(wallet.accountId, "Account ID")}
                className="text-blue-600 text-[10px]"
              >
                Copy
              </button>
            </div>
            <p>{wallet.accountId}</p>

            <p className="pt-1">
              <span className="font-semibold">Balance:</span>{" "}
              <span className="text-green-600 font-medium">{wallet.balance}</span>
            </p>
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <button
              onClick={refreshBalance}
              disabled={loadingBalance}
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {loadingBalance ? "..." : "Refresh"}
            </button>

            <button
              onClick={backupWallet}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Backup
            </button>

            <button
              onClick={clearWallet}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Clear
            </button>
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
              // Hanya tampilan receipt saat send, tidak disimpan
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
