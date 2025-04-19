# Kirlos - Decentralized Crowdfunding Platform

## Overview

Kirlos is a decentralized crowdfunding platform built on the Avalanche Fuji Testnet. It enables users to create fundraising campaigns and receive contributions directly through Web3 wallets like MetaMask. The platform leverages blockchain technology to ensure transparency, security, and immutability for all crowdfunding activities.

## Technology Stack

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality UI components built with Radix UI and Tailwind
- **wouter**: Lightweight router for React applications
- **TanStack Query**: Data fetching and state management library
- **ethers.js**: Library for interacting with the Ethereum blockchain

### Backend
- **Express.js**: Web server framework for the API
- **PostgreSQL**: Relational database for data persistence
- **Drizzle ORM**: TypeScript ORM for database operations
- **Zod**: Schema validation library

### Blockchain
- **Avalanche Fuji Testnet**: The blockchain network used for testing
- **Solidity Smart Contracts**: Used for on-chain crowdfunding logic

## Features

### User Features
- **Connect MetaMask**: Users can connect their MetaMask wallet to the platform
- **Create Campaigns**: Users can create new crowdfunding campaigns with title, description, target amount, and deadline
- **Explore Campaigns**: Browse and search existing campaigns by category or keywords
- **Contribute to Campaigns**: Send AVAX tokens to support campaigns
- **Track Contributions**: Users can view their contribution history
- **View Campaign Details**: See campaign progress, deadline, and other details

### Technical Features
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Dark/Light Mode**: Toggle between dark and light themes
- **Blockchain Integration**: Direct integration with Avalanche Fuji Testnet
- **Database Persistence**: All campaigns and contributions are stored in PostgreSQL
- **API Architecture**: RESTful API for data operations

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- MetaMask wallet extension

### Environment Variables
The application requires the following environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

Additionally, for deployment, you'll need to set up the same variables in your hosting environment.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kirlos.git
cd kirlos
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5000](http://localhost:5000) to view the application in your browser.

### MetaMask Configuration

To interact with the application:

1. Install MetaMask extension in your browser
2. Create or import a wallet
3. Add Avalanche Fuji Testnet to your networks:
   - Network Name: Avalanche Fuji Testnet
   - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
   - Chain ID: 43113
   - Symbol: AVAX
   - Explorer: https://testnet.snowtrace.io/

4. Get test AVAX from the [Avalanche Faucet](https://faucet.avax-test.network/)

## Project Structure

```
kirlos/
├── client/                   # Frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── constants/        # Application constants
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   └── pages/            # Application pages
├── server/                   # Backend application
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Data storage interface
│   └── db.ts                 # Database connection
├── shared/                   # Shared code
│   └── schema.ts             # Database schema and types
└── contracts/                # Solidity smart contracts (to be deployed separately)
```

## API Documentation

### Campaigns

- `GET /api/campaigns`: Get all campaigns
- `GET /api/campaigns?categoryId={id}`: Get campaigns by category
- `GET /api/campaign/{id}`: Get a specific campaign
- `POST /api/campaigns`: Create a new campaign

### Contributions

- `GET /api/contributions/user/{userId}`: Get contributions by user
- `GET /api/contributions/campaign/{campaignId}`: Get contributions for a campaign
- `POST /api/contributions`: Create a new contribution

### Categories

- `GET /api/categories`: Get all categories

## Deployment

The application is configured for deployment on Vercel, with the following considerations:

1. Set up the necessary environment variables in your Vercel project
2. Configure the PostgreSQL database connection
3. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Avalanche for providing the testnet infrastructure
- MetaMask for the wallet integration
- All open-source libraries and tools used in this project