"use client";

const links = [
  { name: "Farcaster", url: "https://farcaster.xyz/banditi" },
  { name: "X (Twitter)", url: "https://x.com/Alidepok1" },
  { name: "GitHub", url: "https://github.com/Beny25" },
];

export default function Footer() {
  return (
    <footer className="mt-4 text-center text-gray-700">
      <p className="text-sm mb-1">
        👉 Follow us:&nbsp;
        {links.map((link, i) => (
          <span key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
              aria-label={`Follow on ${link.name}`}
            >
              {link.name}
            </a>
            {i < links.length - 1 && " · "}
          </span>
        ))}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        © 2025 ChainRitual Wallet → Build, Test, Transact on Linera Microchains
      </p>
    </footer>
  );
}
