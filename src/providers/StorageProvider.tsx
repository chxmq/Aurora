import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeIPFSStorage } from '../services/ipfs';
import { initializePinata } from '../services/pinata';
import { IPFS_CONFIG, PINATA_CONFIG, FEATURES } from '../lib/config';
import { toast } from 'sonner';

interface StorageContextType {
  isInitialized: boolean;
  isIPFSInitialized: boolean;
  isPinataInitialized: boolean;
  error: string | null;
}

const StorageContext = createContext<StorageContextType>({
  isInitialized: false,
  isIPFSInitialized: false,
  isPinataInitialized: false,
  error: null,
});

export const useStorage = () => useContext(StorageContext);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isIPFSInitialized, setIsIPFSInitialized] = useState(false);
  const [isPinataInitialized, setIsPinataInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Mark initialized immediately — localStorage is always available
        setIsInitialized(true);

        if (FEATURES.ENABLE_PINATA) {
          try {
            if (!PINATA_CONFIG.API_KEY || !PINATA_CONFIG.API_SECRET || !PINATA_CONFIG.JWT) {
              throw new Error('Missing Pinata credentials. Check your .env file.');
            }
            initializePinata({
              apiKey: PINATA_CONFIG.API_KEY,
              apiSecret: PINATA_CONFIG.API_SECRET,
              jwt: PINATA_CONFIG.JWT,
            });
            setIsPinataInitialized(true);
          } catch (err) {
            console.error('Pinata initialization failed:', err);
            setError(err instanceof Error ? err.message : 'Pinata initialization failed');
          }
        }

        if (FEATURES.ENABLE_IPFS) {
          try {
            await initializeIPFSStorage(IPFS_CONFIG.EMAIL);
            setIsIPFSInitialized(true);
            toast.success('IPFS storage connected');

          } catch (err) {
            console.error('IPFS/PubSub initialization failed:', err);
            toast.error('IPFS connection failed – using local storage');
            setError(err instanceof Error ? err.message : 'IPFS initialization failed');
          }
        }
      } catch (err) {
        console.error('Storage initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Storage initialization failed');
        toast.error('Storage initialization failed');
      }
    };

    init();
  }, []);

  return (
    <StorageContext.Provider
      value={{ isInitialized, isIPFSInitialized, isPinataInitialized, error }}
    >
      {children}
    </StorageContext.Provider>
  );
}
