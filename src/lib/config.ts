// IPFS Configuration
export const IPFS_CONFIG = {
  EMAIL: import.meta.env.VITE_IPFS_EMAIL || 'your-email@example.com',
};

// Pinata Configuration
export const PINATA_CONFIG = {
  API_KEY: import.meta.env.VITE_PINATA_API_KEY || '',
  API_SECRET: import.meta.env.VITE_PINATA_API_SECRET || '',
  JWT: import.meta.env.VITE_PINATA_JWT || '',
  ENABLED: import.meta.env.VITE_ENABLE_PINATA === 'true' || false,
};

// Local Storage Configuration
export const STORAGE_CONFIG = {
  PREFIX: 'sai_music_',
  VERSION: '1.0.0',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
};

// Feature Flags
export const FEATURES = {
  // IPFS is disabled by default unless explicitly enabled
  ENABLE_IPFS: import.meta.env.VITE_ENABLE_IPFS === 'true' || false,
  ENABLE_PINATA: import.meta.env.VITE_ENABLE_PINATA === 'true' || false,
  ENABLE_LOCAL_STORAGE: true,
  ENABLE_NOTIFICATIONS: true,
};

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 1000 * 60 * 60, // 1 hour
  MAX_ITEMS: 1000,
}; 