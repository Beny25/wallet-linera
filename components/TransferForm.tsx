"use client";

import { useState } from "react";

type Props = {
  walletAddress: string;
  onUpdateBalance: (balance: string) => void;
  onAddHistory: (tx: any) => void;
};

export default function TransferForm({ walletAddress, onUpdateBalance, onAddHistory }: Props) {
  const [amount, setAmount] = useState(0);
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, from: walletAddress, to }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onAddHistory({ type: "transfer", from: walletAddress, to, amount, result: data.result });
      onUpdateBalance(data.balance);
    } catch (err) {
      alert("Transfer failed: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow-md max-w-md mx-auto mt-4">
      <input
        type="text"
        placeholder="Recipient"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border p-1 rounded w-full mb-2"
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="border p-1 rounded w-full mb-2"
      />
      <button
        onClick={handleTransfer}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
