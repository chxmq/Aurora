
import PinataStorageMonitor from "@/components/PinataStorageMonitor";
import { useWallet } from "@/lib/walletUtils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StorageMonitorPage() {
  const { isConnected, address } = useWallet();
  const navigate = useNavigate();

  // Only allow admin access
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  return (
    
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Storage Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your Pinata IPFS storage usage and content
          </p>
        </div>

        <PinataStorageMonitor />
      </div>
    
  );
} 