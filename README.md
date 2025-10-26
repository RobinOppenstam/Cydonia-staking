# Cydonia Staking Platform

A decentralized staking protocol where users can stake ETH, USDC, USDT, and Cydonia tokens to earn rewards. Built on Ethereum with dynamic APR calculations based on lock duration.

## What is Cydonia Protocol?

Cydonia Protocol is a trustless staking platform that allows users to lock their crypto assets for configurable periods and earn Cydonia token (CDN) rewards. The longer you stake, the higher your APR multiplier - up to 2.5x for maximum lock periods. Using smart contracts on Ethereum Sepolia, the platform ensures transparent, automated reward distribution and flexible unstaking without penalties.

## Key Features

### 💰 Multi-Asset Staking
- Stake ETH, USDC, USDT, or Cydonia tokens
- Receive CDN token rewards automatically
- Each asset has its own base APR rate
- Flexible withdrawal without early penalties

### 📈 Dynamic APR System
- ETH base APR: 8%
- Cydonia base APR: 12% (premium rewards)
- USDC/USDT base APR: 6% (stable returns)
- APR multiplier scales with lock duration (1x to 2.5x)
- Lock periods range from 4 weeks to 5 years

### ⏱️ Flexible Lock Periods
- Minimum: 4 weeks (28 days)
- Maximum: 5 years (1,825 days)
- Longer locks earn proportionally higher rewards
- No early withdrawal penalties
- Claim rewards anytime during active stakes

### 🔒 Secure & Transparent
- All logic executed on-chain via smart contracts
- Built with OpenZeppelin security standards
- Reentrancy protection and access controls
- Total supply: 1 trillion CDN tokens
- Rewards distributed over 10-year period

## How It Works

1. **Connect Wallet**: Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
2. **Select Token**: Choose from ETH, Cydonia, USDT, or USDC
3. **Set Amount**: Enter the amount you want to stake
4. **Choose Duration**: Select your lock period (4 weeks to 5 years)
5. **View APR**: See your estimated APR based on token and duration
6. **Stake**: Confirm the transaction and start earning rewards
7. **Claim & Unstake**: Claim rewards anytime or unstake after lock period

## APR Calculation

The protocol uses a dynamic APR model that rewards longer commitments:

### Formula

```
Base APR × Lock Duration Multiplier = Final APR

Lock Duration Multiplier = 1 + ((duration - minDuration) / (maxDuration - minDuration)) × 1.5

Where:
- minDuration = 28 days (4 weeks)
- maxDuration = 1,825 days (5 years)
- Multiplier range = 1x to 2.5x
```

### APR Examples by Token

| Token   | Base APR | 4 Weeks | 26 Weeks | 1 Year  | 3 Years | 5 Years |
|---------|----------|---------|----------|---------|---------|---------|
| ETH     | 8%       | 8%      | 10.2%    | 12.5%   | 16.8%   | 20%     |
| Cydonia | 12%      | 12%     | 15.3%    | 18.8%   | 25.2%   | 30%     |
| USDT    | 6%       | 6%      | 7.7%     | 9.4%    | 12.6%   | 15%     |
| USDC    | 6%       | 6%      | 7.7%     | 9.4%    | 12.6%   | 15%     |

## Example Scenarios

### Conservative Strategy
- **Stake**: 1,000 USDC
- **Duration**: 4 weeks (minimum)
- **APR**: 6%
- **Estimated Annual Return**: 60 USDC worth of CDN tokens
- **Risk**: Very Low ✅

### Balanced Strategy
- **Stake**: 5 ETH
- **Duration**: 1 year
- **APR**: 12.5%
- **Estimated Annual Return**: 0.625 ETH worth of CDN tokens
- **Risk**: Moderate 🟡

### Aggressive Strategy
- **Stake**: 100,000 Cydonia tokens
- **Duration**: 5 years
- **APR**: 30%
- **Estimated Annual Return**: 30,000 CDN tokens per year
- **Risk**: Higher (longer lock) ⚠️

## Project Structure

```
cydonia-staking-platform/
├── contracts/              # Solidity smart contracts
│   ├── src/
│   │   ├── CydoniaStaking.sol    # Main staking contract
│   │   └── CydoniaTokenV2.sol    # CDN token contract
│   ├── script/             # Foundry deployment scripts
│   └── test/               # Contract tests
├── frontend/               # Next.js frontend (legacy)
└── src/                   # Main Next.js application
    ├── app/               # Next.js app directory
    ├── components/        # React components
    │   ├── StakingCard.tsx       # Stake action component
    │   ├── StatsCard.tsx         # Statistics display
    │   └── ActiveStakes.tsx      # User stakes overview
    ├── contracts/         # Contract ABIs and addresses
    ├── providers/         # Web3 providers
    └── styles/           # Global styles
```

## Technology Stack

- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin, Foundry
- **Frontend**: Next.js 14, TypeScript, React 18
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Web3 Integration**: Wagmi v1, Viem, RainbowKit
- **Blockchain**: Ethereum Sepolia Testnet
- **Testing**: Foundry (Forge)

## Deployed Contracts (Sepolia Testnet)

### Core Contracts
- **Staking Contract**: `0x0f5E5b69759738069c4813d21c94602c6C7adA66`
- **Cydonia Token (CDN)**: `0x9e0eEb3864Fcc1b8B67Fee6F56Cd878eB930c795`

### Supported Tokens
- **USDT (Sepolia)**: `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0`
- **USDC (Sepolia)**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`

### Deployment Details
- **Network**: Sepolia (Chain ID: 11155111)
- **Deployed At**: Block #8545552
- **Version**: 2.0
- **Deployer**: `0x7FC771b0675dE44c4ee9E8b40b24B7a4eE2804BC`

## Getting Started

### Prerequisites
- Node.js 18+
- Foundry ([installation guide](https://book.getfoundry.sh/getting-started/installation))
- Git
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cydonia-staking-platform
cd cydonia-staking-platform

# Install frontend dependencies
npm install

# Install Foundry dependencies (for contracts)
cd contracts
forge install
```

### Smart Contract Development

```bash
cd contracts

# Compile contracts
forge build

# Run tests
forge test

# Run tests with detailed output
forge test -vvv

# Generate coverage report
forge coverage

# Deploy to Sepolia testnet
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

### Frontend Development

```bash
# Set up environment variables
cp .env.example .env
# Add your NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env

# Update contract addresses in src/contracts/addresses.json if needed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Configuration

The frontend automatically connects to the deployed Sepolia contracts. Contract addresses are managed in:
- [src/contracts/addresses.json](src/contracts/addresses.json)

To connect to your own deployed contracts, update the addresses in this file.

## Core Contracts

### CydoniaStaking.sol
Main staking contract that handles:
- Multi-token staking (ETH, USDC, USDT, Cydonia)
- Lock duration management
- Dynamic APR calculation
- Reward distribution
- Stake claiming and unstaking

### CydoniaTokenV2.sol
ERC-20 token contract for the Cydonia (CDN) reward token:
- Total supply: 1 trillion tokens
- Used for all staking rewards
- Standard ERC-20 functionality

## User Interface

The platform features a cyberpunk-themed UI with:
- Real-time wallet connection via RainbowKit
- Live stats dashboard showing TVL and rewards
- Interactive staking interface with APR calculator
- Active stakes overview with claim/unstake actions
- Responsive design for mobile and desktop

## Protocol Parameters

| Parameter               | Value                    |
|------------------------|--------------------------|
| Total CDN Supply       | 1,000,000,000,000 tokens |
| Distribution Period    | 10 years                 |
| Minimum Lock           | 4 weeks (28 days)        |
| Maximum Lock           | 5 years (1,825 days)     |
| ETH Base APR           | 8%                       |
| Cydonia Base APR       | 12%                      |
| USDT/USDC Base APR     | 6%                       |
| Maximum APR Multiplier | 2.5x                     |
| Early Withdrawal Fee   | None (0%)                |

## Development Roadmap

- [x] Core staking functionality
- [x] Multi-token support
- [x] Dynamic APR system
- [x] Web3 integration
- [x] Responsive UI
- [ ] Mainnet deployment
- [ ] Governance features
- [ ] Additional token support
- [ ] Mobile app
- [ ] Analytics dashboard

## Security

This project implements security best practices:
- OpenZeppelin battle-tested contracts
- Reentrancy guards on all state-changing functions
- Access control for admin functions
- Comprehensive test coverage
- No early withdrawal penalties (user-friendly)

**Note**: This is a testnet deployment. Always audit smart contracts before mainnet deployment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For support and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the smart contract code

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Smart contracts powered by [Foundry](https://book.getfoundry.sh)
- Web3 integration via [Wagmi](https://wagmi.sh) and [RainbowKit](https://rainbowkit.com)
- UI styled with [Tailwind CSS](https://tailwindcss.com)
