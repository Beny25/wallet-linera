"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  onSuccess: (wallet: { chainId: string; accountId: string; balance: string }) => void;
};

export default function WalletCreateForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_WALLET_API!;
      const res = await fetch(apiUrl, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onSuccess(data);
      toast.success("Wallet created successfully");
    } catch (err: any) {
      toast.error("Failed to create wallet: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      onClick={handleCreate}
      disabled={loading}
    >
      {loading ? "Creating..." : "Create Wallet"}
    </button>
  );
}

