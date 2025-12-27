# <img src="https://github.com/linera-io/linera-protocol/assets/1105398/fe08c941-93af-4114-bb83-bcc0eaec95f9" width="250" height="85" />

# Wallet-Linera (Browser Wallet for Linera Microchains)

[![Twitter](https://img.shields.io/twitter/follow/bandit.base.eth)](https://x.com/Alidepok1)

---

## 🚀 What’s Wallet-Linera?

Wallet-Linera is a **browser-based gateway** to Linera microchains.  
No Rust. No CLI. Just clicks.  

It lets you:

- Generate & manage wallets  
- View your chain & account IDs  
- Request testnet tokens via faucet  
- Send tokens between wallets  
- Track transaction history directly in your browser  

Perfect for developers, designers, and curious builders who don’t want to touch terminal commands.

---

## 🧠 Why it matters

Linera microchains are awesome, but onboarding via CLI can be scary.  
Wallet-Linera brings microchains to your browser — friendly, fast, and fun.  

---

## ⚙️ Current Progress

- Functional wallet UI: create, load, download, delete  
- Client-side key storage for quick prototyping  
- Faucet & transfer flows integrated  
- Transaction history in localStorage  
- Copy & max buttons for easy token management  
- Connected to local Linera validator for testing  

> VPS node & Rust bridge running on port 3000 for API access. Frontend can talk to it via environment variables.

---

## 🧪 What’s next

- Deploy Linera node & faucet for live network use  
- Real-time balance updates after faucet/transfer  
- Simple on-chain interactions (GM, ritual actions)  
- UX improvements & error handling  
- Backup & restore wallet securely  

---

## 💻 How to Use

```bash
# Clone the repo
git clone https://github.com/Beny25/wallet-linera.git

# Enter folder
cd wallet-linera

# Install dependencies
npm install

# Run dev server
npm run dev

Open your browser at http://localhost:5173 (or Vercel link if deployed) and start your ritual! ✨


---

📂 File Structure

/app
  ├─ page.tsx          # Home page UI
/components
  ├─ HeaderBanner.tsx
  ├─ Footer.tsx
  ├─ WalletCreateForm.tsx
  ├─ TransferForm.tsx
/lib
  ├─ linera.ts         # Wallet / balance / transfer helpers
  ├─ share.ts
/rust-bridge
  ├─ main.rs           # Warp backend API


---

📝 Safety Notes

Your private key stays in your browser. Never sent to server.

Backup JSON wallet manually if you care about your coins.

Only use testnet tokens for now!



---

😄 TL;DR

Less CLI.
More clicks.
Same microchains.

Building a friendlier way to interact with Linera one browser tab at a time.


---

🔗 Links

GitHub: https://github.com/Beny25/wallet-linera

- Twitter / X: [@Alidepok1](https://x.com/Alidepok1)
