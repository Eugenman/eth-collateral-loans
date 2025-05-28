# DeFi Lending & Borrowing DApp

A minimal open-source protocol that lets users lend and borrow **ETH** against over-collateralised positions, inspired by Aave & Compound. The goal is to demonstrate core DeFi mechanics (deposits, collateral, interest accrual, liquidation) with clean, production-ready code and tests.

---

## ✨ Features

| Module | Capability |
|--------|------------|
| **Collateral Deposit** | Supply ETH to the protocol and begin earning interest. |
| **Borrowing** | Take out a loan up to a configurable collateral ratio (e.g. 150 %). |
| **Repayment** | Repay part or all of the loan plus accrued interest. |
| **Withdrawal** | Withdraw unlocked collateral once debt is covered. |
| **Liquidation** | Any user may liquidate positions that fall below the minimum collateral ratio. |
| **Admin Config** | Owner (or future DAO) can tweak parameters: interest rate, liquidation bonus, collateral factor. |

---

## 🛠 Tech Stack

- **Solidity ^0.8.x** — smart-contracts (OpenZeppelin base libraries)
- **Hardhat** — compilation, deployment, testing
- **TypeScript + Ethers.js** — scripts & front-end interaction
- **React + Vite** — SPA front-end (Metamask / WalletConnect)
- **Chai / Waffle** — contract tests
- **GitHub Actions** — CI for linting, tests, and optional testnet deploy

---

## 📁 Directory Structure

    ├── contracts/

    ├── frontend/

    ├── scripts/

    ├── test/

    ├── hardhat.config.ts

    ├── package.json

    └── README.md

---

## 🚀 Quick Start

```bash
# 1) Clone repository
git clone https://github.com/<your-handle>/defi-lending-dapp.git
cd defi-lending-dapp

# 2) Install dependencies (root + frontend)
npm install
cd frontend && npm install && cd ..

# 3) Compile contracts
npx hardhat compile

# 4) Start local node & run tests
npx hardhat node &
npx hardhat test
```
---

## 📡 Deploy to Testnet

### Create a .env file at the project root
```
PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=YOUR_KEY   # optional for verification
```

### Deploy
```
npx hardhat run scripts/deploy.ts --network sepolia
```
---

## 🧪 Testing

### Hardhat tests live in /test and cover:
* Deposit & balance tracking
* Borrow limits and interest accrual
* Repayment logic
* Liquidation path & collateral auctions

### Run with
```
npx hardhat test
```
---

## 🗺 Roadmap

* Integrate Chainlink Price Feed for real-time ETH/USD
* Migrate ETH → ERC20 collateral support
* Implement DAO governance (OpenZeppelin Governor)
* Add subgraph for analytics (The Graph)
* Deploy front-end to Vercel & contracts to Mainnet / L2
---
## 🤝 Contributing
Pull requests are welcome! Please open an issue first to discuss changes. Follow conventional commits & ensure test coverage ≥ 80 %
---
## 📄 License
Distributed under the MIT License. See LICENSE for more information.

## 👤 Author
Evgenii Kruglov — reach out on LinkedIn if you have questions or job opportunities!