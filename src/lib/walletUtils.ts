import React, { useState, useEffect, createContext, useContext } from "react";
import { toast } from "sonner";

// Wallet context type definition
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
          if (!window.ethereum) {
            toast.error("MetaMask is not installed. Please install MetaMask to continue.");
            setIsConnected(false);
            localStorage.removeItem("walletConnected");
            return;
          }
          
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
            setIsConnected(false);
            localStorage.removeItem("walletConnected");
            toast.error("No connected accounts found. Please connect your wallet.");
          }
        } catch (error) {
          console.error("Error reconnecting wallet:", error);
          setIsConnected(false);
          localStorage.removeItem("walletConnected");
          toast.error("Failed to reconnect wallet. Please connect manually.");
        }
      }
    };
    
    checkConnection();
  }, []);
  
  // Connect wallet function
  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed. Please install MetaMask to continue.");
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
      } else {
        toast.error("No accounts found. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
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

    try {
      toast.loading("Processing transaction...");
      // Convert ETH to Wei
      const valueWei = (BigInt(Math.floor(parseFloat(amount) * 1e18))).toString(16);
      const txParams = {
        from: address,
        to: artistAddress,
        value: '0x' + valueWei,
      };
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      toast.dismiss();
      toast.success(`Transaction sent! Hash: ${txHash.substring(0, 10)}...`);
      callback();
    } catch (error: any) {
      toast.dismiss();
      if (error && error.message) {
        toast.error(`Transaction failed: ${error.message}`);
      } else {
        toast.error("Transaction failed");
      }
      console.error("Error sending ETH:", error);
    }
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
