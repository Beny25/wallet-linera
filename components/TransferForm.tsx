"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  walletAddress: string; // sender CHAIN ID
  balance: string;
  onUpdateBalance: (bal: string) => void;
  onAddHistory: (tx: any) => void;
};

// Chain ID Linera = 64 hex
const CHAIN_ID_REGEX = /^[a-f0-9]{64}$/i;

export default function TransferForm({
  walletAddress,
  balance,
  onUpdateBalance,
  onAddHistory,
}: Props) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numericBalance = Number(balance.replace(/[^\d]/g, ""));

  const handleMax = () => {
    if (numericBalance <= 0) {
      toast.error("Balance empty");
      return;
    }
    setAmount(String(numericBalance));
  };

  const handleSend = async () => {
    /* ---------- VALIDATION ---------- */
    if (!to || !amount) {
      toast.error("Recipient & amount required");
      return;
    }

    if (!CHAIN_ID_REGEX.test(to)) {
      toast.error("Invalid recipient Chain ID");
      return;
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Amount must be > 0");
      return;
    }

    if (amt > numericBalance) {
      toast.error("Insufficient balance");
      return;
    }

    /* ---------- TRANSFER ---------- */
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TRANSFER_API}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: walletAddress, // CHAIN ID ONLY
            to,                  // CHAIN ID ONLY
            amount: amt,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Transfer failed");
      }

      // update balance dari backend
      if (data.balance !== undefined) {
        onUpdateBalance(data.balance);
      }

      onAddHistory({
        type: "send",
        amount: amt,
        from: walletAddress,
        to,
        result: "success",
        time: new Date().toISOString(),
      });

      setAmount("");
      setTo("");
      toast.success("Transfer success!");
    } catch (err: any) {
      toast.error(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-2 text-sm">
      <h3 className="font-semibold">Send</h3>

      {/* Recipient */}
      <input
        type="text"
        placeholder="Recipient Chain ID (64 hex)"
        value={to}
        onChange={(e) => setTo(e.target.value.trim())}
        className="w-full border rounded-lg p-2 text-xs"
      />

      <p className="text-[10px] text-gray-500">
        Recipient must be an already opened Linera Chain ID
      </p>

      {/* Amount + MAX */}
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 border rounded-lg p-2"
        />
        <button
          type="button"
          onClick={handleMax}
          className="px-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-semibold"
        >
          MAX
        </button>
      </div>

      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg p-2 mt-1 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
  }
