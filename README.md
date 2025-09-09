# Ether Veil Vault

A privacy-preserving vault platform built with FHE (Fully Homomorphic Encryption) technology, enabling secure asset management and transactions while maintaining complete privacy.

## Features

- **Privacy-First Design**: All sensitive data is encrypted using FHE technology
- **Secure Asset Management**: Manage your digital assets with complete privacy
- **Wallet Integration**: Connect with popular Web3 wallets
- **Real-time Portfolio Tracking**: Monitor your assets securely
- **Decentralized Architecture**: Built on blockchain technology

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Blockchain**: Solidity, FHEVM
- **Privacy**: Fully Homomorphic Encryption (FHE)
- **Wallet Integration**: Web3 wallet connectors

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ShaSear64/ether-veil-vault.git
cd ether-veil-vault
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Application header
│   ├── AssetList.tsx   # Asset management component
│   └── PortfolioCard.tsx # Portfolio display component
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── contracts/          # Smart contracts
```

## Smart Contracts

The project includes FHE-enabled smart contracts for:
- Secure asset storage
- Privacy-preserving transactions
- Encrypted balance tracking
- Anonymous portfolio management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_RPC_URL=your_rpc_url
VITE_CONTRACT_ADDRESS=your_contract_address
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Security

This project uses FHE technology to ensure complete privacy. All sensitive operations are performed on encrypted data without revealing the underlying values.

## Support

For support and questions, please open an issue on GitHub.