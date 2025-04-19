// Contract ABI for the crowdfunding smart contract
export const CROWDFUNDING_ABI = [
  "function createCampaign(string memory _title, string memory _description, uint256 _targetAmount, uint256 _deadline) external returns (uint256)",
  "function donateToCampaign(uint256 _campaignId) external payable",
  "function getCampaign(uint256 _campaignId) external view returns (address creator, string memory title, string memory description, uint256 targetAmount, uint256 currentAmount, uint256 deadline, bool isActive)",
  "function getCampaignsCount() external view returns (uint256)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 targetAmount, uint256 deadline)",
  "event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)"
];

// Avalanche Fuji Testnet configuration
export const AVALANCHE_FUJI_CONFIG = {
  chainId: "0xa869", // 43113 in hex
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18
  },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"]
};

// Contract address on Avalanche Fuji Testnet
export const CROWDFUNDING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual contract address

// Category colors
export const CATEGORY_COLORS = {
  "Technology": "#6366f1",
  "Art & Creative": "#8b5cf6",
  "Community": "#10b981",
  "DeFi": "#3b82f6",
  "NFT": "#f59e0b",
  "Gaming": "#ef4444"
};

// Navigation items
export const NAV_ITEMS = [
  { name: "Dashboard", path: "/", icon: "home" },
  { name: "Explore Campaigns", path: "/explore", icon: "search" },
  { name: "Create Campaign", path: "/create", icon: "plus-circle" },
  { name: "My Contributions", path: "/contributions", icon: "history" },
  { name: "Settings", path: "/settings", icon: "cog" }
];
