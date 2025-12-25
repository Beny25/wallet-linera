"use client";

import { useState } from "react";
import WalletCreateForm from "../components/WalletCreateForm";
import TransferForm from "../components/TransferForm";

export default function Home() {
  const [wallet, setWallet] = useState<{ chainId: string; accountId: string; balance: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      {!wallet ? (
        <WalletCreateForm onSuccess={setWallet} />
      ) : (
        <div className="text-center p-6 bg-white rounded shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Wallet Created!</h2>
          <p>Chain ID: {wallet.chainId}</p>
          <p>Account ID: {wallet.accountId}</p>
          <p>Balance: {wallet.balance}</p>

          <TransferForm
            walletAddress={`${wallet.chainId}:${wallet.accountId}`}
            onUpdateBalance={(bal) => setWallet({ ...wallet, balance: bal })}
            onAddHistory={(tx) => setHistory((prev) => [...prev, tx])}
          />

          {history.length > 0 && (
            <div className="mt-4 text-left">
              <h3 className="font-bold mb-2">Transaction History</h3>
              {history.map((tx, idx) => (
                <div key={idx} className="border p-2 rounded mb-1">
                  <p>
                    {tx.type.toUpperCase()} {tx.amount} from {tx.from} → {tx.to}
                  </p>
                  <p>Result: {tx.result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
