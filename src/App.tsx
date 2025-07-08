import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WalletProvider } from "@/lib/walletUtils";
import { DataProvider } from "@/lib/DataProvider";
import { StorageProvider } from "@/lib/StorageProvider";
import { Layout } from "@/components/Layout";

// Pages
import Index from "@/pages/Index";
import Explore from "@/pages/Explore";
import ViralSounds from "@/pages/ViralSounds";
import Create from "@/pages/Create";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import StorageMonitor from "@/pages/StorageMonitor";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <StorageProvider>
      <WalletProvider>
        <DataProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="viral-sounds" element={<ViralSounds />} />
                  <Route path="create" element={<Create />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="storage-monitor" element={<StorageMonitor />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              
              {/* Toast notifications with Aurora styling */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                  },
                  className: 'glass',
                }}
                theme="system"
                richColors
              />
            </div>
          </Router>
        </DataProvider>
      </WalletProvider>
    </StorageProvider>
  );
}

export default App;
