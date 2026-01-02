"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  walletAddress: string;
  balance: string;
  onUpdateBalance: (bal: string) => void;
  onAddHistory: (tx: any) => void;
};

const isValidChainId = (v: string) =>
  /^[a-f0-9]{64}$/.test(v.trim());

export default function TransferForm({
  walletAddress,
  balance,
  onUpdateBalance,
  onAddHistory,
}: Props) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numericBalance = Number(balance.replace(".", ""));

  const handleMax = () => {
    if (numericBalance <= 0) {
      toast.error("Balance empty");
      return;
    }
    setAmount(String(numericBalance));
  };

  const handleSend = async () => {
    const recipient = to.trim();

    if (!recipient || !amount) {
      toast.error("Recipient & amount required");
      return;
    }

    if (!isValidChainId(recipient)) {
      toast.error("Recipient must be a valid 64-char chain ID");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Amount must be > 0");
      return;
    }

    if (Number(amount) > numericBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TRANSFER_API}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: walletAddress, // chainId only
            to: recipient,
            amount,
          }),
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onUpdateBalance(data.balance);

      onAddHistory({
        type: "send",
        amount,
        from: walletAddress,
        to: recipient,
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
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Send</h3>

      {/* Recipient */}
      <input
        type="text"
        placeholder="Recipient Chain ID (64 hex)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full border rounded-lg p-2 text-xs"
      />

      <p className="text-[10px] text-gray-500">
        Must be an existing Linera chain ID (64 lowercase hex)
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
