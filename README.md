# <img src="https://github.com/linera-io/linera-protocol/assets/1105398/fe08c941-93af-4114-bb83-bcc0eaec95f9" width="250" height="85" />

# Wallet-Linera  
**Browser Wallet for Linera Microchains**

[![Twitter](https://img.shields.io/twitter/follow/bandit.base.eth?style=social)](https://x.com/Alidepok1)

---

## 🚀 What is Wallet-Linera?

**Wallet-Linera** is a browser-based wallet interface for **Linera microchains**, designed to make Linera easier to use without requiring users to interact directly with the Rust CLI.

The frontend runs in the browser, while blockchain operations are handled by a **Rust bridge service** that connects to a Linera node and faucet.

---

## ✨ Features

- Generate & manage Linera wallets  
- Request a new microchain via faucet  
- View chain ID, account ID, and balance  
- Transfer tokens between accounts  
- Simple REST API powered by Rust (Warp)  
- Works with local node or VPS deployment  

---

## 🧠 Why this matters

Linera’s microchain model is powerful, but onboarding via CLI can be intimidating.

Wallet-Linera lowers the barrier by:
- Keeping the user experience in the browser  
- Delegating Linera CLI execution to a backend service  
- Enabling fast experimentation with microchains  

This project is an early step toward **user-friendly Linera wallets and MiniApps**.

---

## 🏗 Architecture

Browser (Next.js) ↓ HTTP Rust Bridge (Warp API :3000) ↓ CLI Linera Node + Faucet ↓ Wallet & Keystore (VPS / Local)

> Linera does **not** run in the browser.  
> All blockchain interactions are executed by the Rust bridge.

---

## 🧪 API Endpoints

| Endpoint | Method | Description |
|--------|--------|-------------|
| `/api/wallet` | POST | Initialize wallet & request chain |
| `/api/balance` | POST | Query balance by chain ID |
| `/api/transfer` | POST | Transfer tokens |

Example:
```bash
curl -X POST http://<VPS-IP>:3000/api/wallet


---

🐳 Run with Docker (Recommended)

git clone https://github.com/Beny25/wallet-linera.git
cd wallet-linera

docker compose build
docker compose up

Open in browser

Frontend: http://<VPS-IP>:5173

API: http://<VPS-IP>:3000


Make sure these ports are open: 5173, 3000, 8080, 13001


---

📂 Project Structure

/app            # Next.js app routes
/components     # UI components
/lib            # Frontend helpers
/rust-bridge    # Rust Warp API (Linera CLI bridge)
/scripts        # Faucet & helper scripts


---

⚙️ Tech Stack

Frontend: Next.js (App Router)

Backend: Rust + Warp

Blockchain: Linera Protocol

Infra: Docker, VPS, optional Nginx



---

🔐 Security Notes

Wallet keys are stored locally (browser or VPS keystore)

Never use mainnet funds

Testnet / local validator only

This project is experimental



---

🧭 Roadmap

Stable Testnet Conway integration

Persistent node & validator setup

HTTPS + domain support

Transaction history indexing

Linera MiniApp interactions (GM / Ritual actions)



---

😄 TL;DR

Less CLI.
More browser.
Same Linera microchains.

Building a friendlier way to interact with Linera — one browser tab at a time.


---

🔗 Links

GitHub: https://github.com/Beny25/wallet-linera

Twitter / X: @Alidepok1
