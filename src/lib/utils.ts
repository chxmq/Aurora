import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Converts an ipfs:// URL to a Pinata gateway URL, or returns the original URL if not ipfs.
 */
export function getGatewayUrl(url: string): string {
  if (url && url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return url;
}
