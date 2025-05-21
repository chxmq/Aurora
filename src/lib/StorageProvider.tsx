import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeIPFSStorage } from './ipfsStorage';
import { initializePinata } from './pinataStorage';
import { initializePubSub } from './realtimeSync';
import { IPFS_CONFIG, PINATA_CONFIG, FEATURES } from './config';
import { toast } from 'sonner';
import { initializeIfEmpty } from './mockData';

interface StorageContextType {
  isInitialized: boolean;
  isIPFSInitialized: boolean;
  isPinataInitialized: boolean;
  isPubSubInitialized: boolean;
  error: string | null;
}

const StorageContext = createContext<StorageContextType>({
  isInitialized: false,
  isIPFSInitialized: false,
  isPinataInitialized: false,
  isPubSubInitialized: false,
  error: null
});

export const useStorage = () => useContext(StorageContext);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isIPFSInitialized, setIsIPFSInitialized] = useState(false);
  const [isPinataInitialized, setIsPinataInitialized] = useState(false);
  const [isPubSubInitialized, setIsPubSubInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing storage...");

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Initialize mock data first
        setLoadingMessage("Initializing local storage...");
        initializeIfEmpty();
        console.log('Mock data initialized');
        
        // Set basic initialization to true so UI can render
        setIsInitialized(true);

        // Initialize Pinata if enabled
        if (FEATURES.ENABLE_PINATA) {
          try {
            setLoadingMessage("Connecting to Pinata...");
            console.log('Initializing Pinata...');
            
            // Check if we have all required Pinata credentials
            if (!PINATA_CONFIG.API_KEY || !PINATA_CONFIG.API_SECRET || !PINATA_CONFIG.JWT) {
              throw new Error('Missing Pinata credentials');
            }
            
            initializePinata({
              apiKey: PINATA_CONFIG.API_KEY,
              apiSecret: PINATA_CONFIG.API_SECRET,
              jwt: PINATA_CONFIG.JWT
            });
            
            setIsPinataInitialized(true);
            toast.success('Pinata storage connected');
          } catch (pinataError) {
            console.error('Pinata initialization failed:', pinataError);
            toast.error('Pinata connection failed - falling back to local storage');
            setError(pinataError instanceof Error ? pinataError.message : 'Pinata initialization failed');
          }
        }

        // Initialize IPFS if enabled (but don't block the UI)
        if (FEATURES.ENABLE_IPFS) {
          try {
            setLoadingMessage("Connecting to IPFS network...");
            console.log('Initializing IPFS with email:', IPFS_CONFIG.EMAIL);
            await initializeIPFSStorage(IPFS_CONFIG.EMAIL);
            setIsIPFSInitialized(true);
            toast.success('IPFS storage connected');

            // Initialize PubSub for real-time sync
            setLoadingMessage("Setting up real-time synchronization...");
            await initializePubSub();
            setIsPubSubInitialized(true);
            toast.success('Real-time sync enabled');
          } catch (ipfsError) {
            console.error('IPFS/PubSub initialization failed:', ipfsError);
            toast.error('IPFS connection failed - falling back to local storage');
            setError(ipfsError instanceof Error ? ipfsError.message : 'IPFS initialization failed');
          }
        }

        console.log('Storage initialization complete');
      } catch (error) {
        console.error('Storage initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Storage initialization failed');
        toast.error('Storage initialization failed');
      }
    };

    initializeStorage();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-muted-foreground mb-2">{loadingMessage}</p>
          <div className="flex justify-center items-center space-x-2">
            <div className="w-2 h-2 bg-music-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-music-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-music-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StorageContext.Provider value={{
      isInitialized,
      isIPFSInitialized,
      isPinataInitialized,
      isPubSubInitialized,
      error
    }}>
      {children}
    </StorageContext.Provider>
  );
} 