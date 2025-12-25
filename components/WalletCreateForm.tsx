"use client";

import { useState } from "react";
import { createWallet, queryBalance } from "../lib/linera";

type Props = {
  faucetUrl: string;
  onSuccess: (wallet: { chainId: string; accountId: string; balance?: string }) => void;
};

export default function WalletCreateForm({ faucetUrl, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const wallet = await createWallet(faucetUrl);
      const bal = await queryBalance(`${wallet.chainId}:${wallet.accountId}`);
      wallet.balance = bal;
      onSuccess(wallet);
    } catch (err) {
      alert("Failed to create wallet: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {loading ? "Creating..." : "Create Wallet"}
    </button>
  );
}
