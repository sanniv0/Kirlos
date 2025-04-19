import { useState, useEffect, useCallback } from 'react';
import { connectWallet, getWalletBalance, switchToAvalancheFuji } from '@/lib/ethers';
import { useToast } from '@/hooks/use-toast';
import { AVALANCHE_FUJI_CONFIG } from '@/constants';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  balance: string | null;
  isCorrectNetwork: boolean;
  isLoading: boolean;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
    isCorrectNetwork: false,
    isLoading: false
  });
  
  const { toast } = useToast();
  
  const updateBalance = useCallback(async (address: string) => {
    if (!address) return;
    
    const balance = await getWalletBalance(address);
    if (balance) {
      setWallet(prev => ({ ...prev, balance }));
    }
  }, []);
  
  const connect = useCallback(async () => {
    setWallet(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await connectWallet();
      
      if (!result) {
        toast({
          title: "MetaMask connection failed",
          description: "Please make sure you have MetaMask installed and unlocked.",
          variant: "destructive"
        });
        return;
      }
      
      const { address, chainId } = result;
      const isCorrectNetwork = chainId === AVALANCHE_FUJI_CONFIG.chainId;
      
      setWallet({
        address,
        isConnected: true,
        chainId,
        balance: null,
        isCorrectNetwork,
        isLoading: false
      });
      
      // Update balance after connection
      updateBalance(address);
      
      // If not on correct network, prompt to switch
      if (!isCorrectNetwork) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Avalanche Fuji Testnet",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to wallet. Please try again.",
        variant: "destructive"
      });
      
      setWallet(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast, updateBalance]);
  
  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
      isCorrectNetwork: false,
      isLoading: false
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected."
    });
  }, [toast]);
  
  const switchNetwork = useCallback(async () => {
    setWallet(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await switchToAvalancheFuji();
      
      if (success) {
        setWallet(prev => ({ 
          ...prev, 
          isCorrectNetwork: true, 
          chainId: AVALANCHE_FUJI_CONFIG.chainId,
          isLoading: false 
        }));
        
        toast({
          title: "Network Switched",
          description: "Successfully connected to Avalanche Fuji Testnet."
        });
      } else {
        setWallet(prev => ({ ...prev, isLoading: false }));
        toast({
          title: "Network Switch Failed",
          description: "Failed to switch network. Please try manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Network switch error:", error);
      setWallet(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Network Switch Error",
        description: "Failed to switch to Avalanche Fuji Testnet.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // Listen for network changes
  useEffect(() => {
    // Make sure ethereum exists on window and is properly typed
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    const ethereum = window.ethereum as any;
    
    const handleChainChanged = (chainId: string) => {
      const isCorrectNetwork = chainId === AVALANCHE_FUJI_CONFIG.chainId;
      setWallet(prev => ({ 
        ...prev, 
        chainId, 
        isCorrectNetwork 
      }));
      
      // Update balance when chain changes
      if (wallet.address) {
        updateBalance(wallet.address);
      }
    };
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnect();
      } else if (accounts[0] !== wallet.address) {
        // Account changed
        setWallet(prev => ({ 
          ...prev, 
          address: accounts[0] 
        }));
        
        // Update balance for new account
        updateBalance(accounts[0]);
      }
    };
    
    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [disconnect, updateBalance, wallet.address]);
  
  // Auto-refresh balance periodically
  useEffect(() => {
    if (!wallet.address) return;
    
    const intervalId = setInterval(() => {
      updateBalance(wallet.address!);
    }, 15000); // Every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [updateBalance, wallet.address]);
  
  return {
    wallet,
    connect,
    disconnect,
    switchNetwork,
    updateBalance
  };
};
