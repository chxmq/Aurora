
import React, { useState, useEffect, createContext, useContext } from "react";
import { toast } from "sonner";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  tipArtist?: (artistAddress: string, amount: string, callback: () => void) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  balance: null,
  connectWallet: async () => {},
  disconnectWallet: () => {}
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  
  // Check if MetaMask is installed and if we have saved connection state
  useEffect(() => {
    const checkConnection = async () => {
      const savedConnection = localStorage.getItem("walletConnected");
      
      if (savedConnection === "true") {
        try {
          // Check if ethereum object exists
          if (window.ethereum) {
            // Request accounts
            const accounts = await window.ethereum.request({
              method: "eth_accounts",
            });
            
            if (accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
              
              // Get balance
              const balance = await window.ethereum.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
              });
              
              const ethBalance = parseInt(balance, 16) / 1e18;
              setBalance(ethBalance.toFixed(4));
            } else {
              // No accounts found but localStorage says connected
              mockConnectWallet();
            }
          } else {
            // No ethereum object but localStorage says connected
            mockConnectWallet();
          }
        } catch (error) {
          console.error("Error reconnecting wallet:", error);
          setIsConnected(false);
          localStorage.removeItem("walletConnected");
        }
      }
    };
    
    checkConnection();
  }, []);
  
  // Connect wallet function
  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      // MetaMask not found - mock for testing
      mockConnectWallet();
      return;
    }
    
    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        localStorage.setItem("walletConnected", "true");
        
        // Get balance
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        });
        
        const ethBalance = parseInt(balance, 16) / 1e18;
        setBalance(ethBalance.toFixed(4));
        
        toast.success("Wallet connected successfully!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
      
      // Mock connection for testing
      mockConnectWallet();
    }
  };
  
  const mockConnectWallet = () => {
    // For testing without MetaMask
    const mockAddresses = [
      "0x123",  // User 1
      "0x456",  // User 2
      "0x789",  // User 3
      "0xabc",  // User 4
      "0xdef"   // User 5
    ];
    
    // Pick a random address for testing
    const mockAddr = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
    setAddress(mockAddr);
    setBalance("1.2345");
    setIsConnected(true);
    localStorage.setItem("walletConnected", "true");
    toast.success("Mock wallet connected successfully!");
  };
  
  // Disconnect wallet function
  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
    setIsConnected(false);
    localStorage.removeItem("walletConnected");
    toast.info("Wallet disconnected");
  };

  // Function to send tips to artists
  const tipArtist = async (artistAddress: string, amount: string, callback: () => void) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // For demo, just mock a successful transaction
    toast.loading("Processing transaction...");
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.dismiss();
    toast.success(`Successfully sent ${amount} ETH to ${artistAddress.substring(0, 6)}...`);
    callback();
  };
  
  // Prepare context value
  const contextValue = {
    isConnected,
    address,
    balance,
    connectWallet,
    disconnectWallet,
    tipArtist
  };
  
  // Return the provider component
  return React.createElement(
    WalletContext.Provider,
    { value: contextValue },
    children
  );
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => useContext(WalletContext);
