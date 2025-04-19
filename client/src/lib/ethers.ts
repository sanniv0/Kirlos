import { ethers } from "ethers";
import { AVALANCHE_FUJI_CONFIG, CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from "@/constants";

// Define type for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

// Get Ethereum provider
export const getProvider = (): ethers.BrowserProvider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

// Get signer for transactions
export const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
  const provider = getProvider();
  if (!provider) return null;
  return provider.getSigner();
};

// Get contract instance
export const getContract = async () => {
  const signer = await getSigner();
  if (!signer) return null;
  
  return new ethers.Contract(
    CROWDFUNDING_CONTRACT_ADDRESS,
    CROWDFUNDING_ABI,
    signer
  );
};

// Connect to Metamask
export const connectWallet = async (): Promise<{ address: string, chainId: string } | null> => {
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error("MetaMask not detected. Please install or unlock MetaMask to continue.");
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();

    return { address, chainId };
  } catch (error) {
    console.error("Failed to connect to wallet:", error);
    return null;
  }
};

// Switch to Avalanche Fuji Testnet
export const switchToAvalancheFuji = async (): Promise<boolean> => {
  try {
    if (!window.ethereum) return false;
    
    try {
      // Try to switch to the chain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [AVALANCHE_FUJI_CONFIG],
        });
        return true;
      }
      throw switchError;
    }
  } catch (error) {
    console.error("Failed to switch network:", error);
    return false;
  }
};

// Create a new campaign
export const createCampaign = async (
  title: string, 
  description: string, 
  targetAmount: string,
  deadline: Date
): Promise<{ campaignId: string, txHash: string } | null> => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contract not initialized");
    
    // Convert target amount to wei
    const targetAmountWei = ethers.parseEther(targetAmount);
    
    // Convert deadline to Unix timestamp
    const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);
    
    // Call contract function
    const tx = await contract.createCampaign(
      title,
      description,
      targetAmountWei,
      deadlineTimestamp
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Parse event to get campaign ID
    const event = receipt.logs.find(
      (log: any) => log.topics[0] === ethers.id("CampaignCreated(uint256,address,string,uint256,uint256)")
    );
    
    if (!event) throw new Error("Campaign creation event not found");
    
    // Parse the event data to get the campaign ID
    // Using a different approach in ethers v6 since decodeEventLog may not be available
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const campaignId = abiCoder.decode(
      ["uint256", "address", "string", "uint256", "uint256"],
      event.data
    )[0];
    
    return { 
      campaignId: campaignId.toString(),
      txHash: receipt.hash 
    };
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return null;
  }
};

// Contribute to a campaign
export const contributeToCampaign = async (
  campaignId: number,
  amount: string
): Promise<{ txHash: string } | null> => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contract not initialized");
    
    // Convert amount to wei
    const amountWei = ethers.parseEther(amount);
    
    // Call contract function with value
    const tx = await contract.donateToCampaign(campaignId, {
      value: amountWei
    });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return { txHash: receipt.hash };
  } catch (error) {
    console.error("Failed to contribute to campaign:", error);
    return null;
  }
};

// Get wallet balance
export const getWalletBalance = async (address: string): Promise<string | null> => {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Failed to get wallet balance:", error);
    return null;
  }
};
