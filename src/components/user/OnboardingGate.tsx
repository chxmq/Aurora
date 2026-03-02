import { useState, useEffect } from "react";
import { useWallet } from "@/providers/walletUtils";
import { useData } from "@/providers/DataProvider";
import { getUsers, saveCurrentUser } from "@/services/localStorage";
import { User } from "@/lib/types";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingGate() {
  const { isConnected, address } = useWallet();
  const { setCurrentUser, refreshData } = useData();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setNeedsOnboarding(false);
      return;
    }

    const existing = getUsers().find(
      u => u.walletAddress?.toLowerCase() === address.toLowerCase()
    );

    if (existing) {
      // Returning user — persist and surface their profile immediately
      saveCurrentUser(existing);
      setCurrentUser(existing);
      refreshData();
      setNeedsOnboarding(false);
    } else {
      // New wallet — show signup flow
      setNeedsOnboarding(true);
    }
  }, [isConnected, address]);

  const handleComplete = (user: User) => {
    setCurrentUser(user);
    refreshData();
    setNeedsOnboarding(false);
  };

  if (!needsOnboarding || !address) return null;

  return (
    <OnboardingModal
      open={needsOnboarding}
      walletAddress={address}
      onComplete={handleComplete}
    />
  );
}
