"use client";

import { useState } from "react";

type Props = {
  onSuccess: (wallet: { chainId: string; accountId: string; balance: string }) => void;
};

export default function WalletCreateForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onSuccess(data);
    } catch (err) {
      alert("Failed to create wallet: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={handleCreate}
      disabled={loading}
    >
      {loading ? "Creating..." : "Create Wallet"}
    </button>
  );
}
