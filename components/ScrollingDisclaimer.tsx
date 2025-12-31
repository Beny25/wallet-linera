"use client";

export default function ScrollingDisclaimer() {
  return (
    <div className="w-full bg-black/80 backdrop-blur-sm text-green-300 py-2 px-4 rounded-xl mt-4 overflow-hidden shadow-[0_0_15px_rgba(0,255,0,0.4)] border border-green-700">
      <div
        className="whitespace-nowrap font-mono tracking-wide text-sm flex animate-scroll"
        style={{ textShadow: "0 0 6px #00ff55, 0 0 10px #00ff55" }}
      >
        <span className="px-4">⬢ TESTNET / DEMO ONLY</span>
        <span className="px-4">→ No Real Assets</span>
        <span className="px-4">→ Educational Purpose</span>
        <span className="px-4">→ Built for Experimentation</span>
        <span className="px-4">→ Use at Your Own Risk</span>

        {/* Duplicate untuk smooth loop */}
        <span className="px-4">⬢ TESTNET / DEMO ONLY</span>
        <span className="px-4">→ No Real Assets</span>
        <span className="px-4">→ Educational Purpose</span>
        <span className="px-4">→ Built for Experimentation</span>
        <span className="px-4">→ Use at Your Own Risk</span>
      </div>
    </div>
  );
}
