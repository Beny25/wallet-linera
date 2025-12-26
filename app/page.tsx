"use client";

import { useState } from "react";

import HeaderBanner from "../components/HeaderBanner";
import Footer from "../components/Footer";
import WalletCreateForm from "../components/WalletCreateForm";
import TransferForm from "../components/TransferForm";

export default function Home() {
  const [wallet, setWallet] = useState<{
    chainId: string;
    accountId: string;
    balance: string;
  } | null>(null);

  const [history, setHistory] = useState<any[]>([]);

  return (
    <div className="max-w-md mx-auto mt-2 p-4 space-y-6">
      {/* HEADER */}
      <HeaderBanner />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {!wallet ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
            <h1 className="text-2xl font-bold mb-2">ChainRitual Wallet</h1>
            <p className="text-gray-500 mb-6">
              Create your Linera wallet and start your ritual ✨
            </p>

            <WalletCreateForm onSuccess={setWallet} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">
              Your Wallet
            </h2>

            {/* WALLET INFO */}
            <div className="bg-gray-100 rounded-lg p-4 text-sm break-all">
              <p className="mb-1">
                <span className="font-semibold">Chain ID:</span>
                <br />
                {wallet.chainId}
              </p>
              <p className="mb-1 mt-2">
                <span className="font-semibold">Account ID:</span>
                <br />
                {wallet.accountId}
              </p>
              <p className="mt-2">
                <span className="font-semibold">Balance:</span>{" "}
                {wallet.balance}
              </p>
            </div>

            {/* TRANSFER */}
            <TransferForm
              walletAddress={`${wallet.chainId}:${wallet.accountId}`}
              onUpdateBalance={(bal) =>
                setWallet({ ...wallet, balance: bal })
              }
              onAddHistory={(tx) =>
                setHistory((prev) => [...prev, tx])
              }
            />

            {/* HISTORY */}
            {history.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">
                  Transaction History
                </h3>

                <div className="space-y-2 text-sm">
                  {history.map((tx, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <p className="font-medium">
                        {tx.type.toUpperCase()} {tx.amount}
                      </p>
                      <p className="text-gray-600 break-all">
                        {tx.from} → {tx.to}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Result: {tx.result}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
