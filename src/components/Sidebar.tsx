
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Bell, User, BarChart3, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/walletUtils";

export default function Sidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isConnected, connectWallet, address } = useWallet();
  
  const navLinks = [
    { 
      path: "/", 
      label: "Home", 
      icon: <Home className="h-5 w-5 mr-3" /> 
    },
    { 
      path: "/viral-sounds", 
      label: "Viral Sounds", 
      icon: <BarChart3 className="h-5 w-5 mr-3" /> 
    },
    { 
      path: "/explore", 
      label: "Explore", 
      icon: <Compass className="h-5 w-5 mr-3" /> 
    },
    { 
      path: "/notifications", 
      label: "Notifications", 
      icon: <Bell className="h-5 w-5 mr-3" /> 
    },
    { 
      path: "/profile", 
      label: "Profile", 
      icon: <User className="h-5 w-5 mr-3" /> 
    }
  ];
  
  const getNavItemClasses = (isActive: boolean) => {
    return cn(
      "flex items-center px-4 py-3 rounded-lg transition-colors",
      isActive 
        ? "bg-music-primary text-white font-medium" 
        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
    );
  };

  // For small screens, render a mobile-optimized bottom navigation bar
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t z-40 h-16">
        <div className="flex items-center justify-around h-full">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                cn(
                  "flex flex-col items-center justify-center w-16 h-full",
                  isActive ? "text-music-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {React.cloneElement(link.icon, { 
                    className: cn("h-5 w-5 mb-1", isActive ? "text-music-primary" : "text-muted-foreground")
                  })}
                  <span className="text-xs">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    );
  }
  
  // For larger screens, render a sidebar
  return (
    <div className="fixed top-0 left-0 bottom-0 w-60 bg-background border-r p-4 overflow-y-auto flex flex-col z-30">
      <div className="flex items-center mb-8">
        <Link to="/" className="flex items-center font-bold text-xl">
          <span className="text-music-primary">SOUND</span>
          <span>NFT</span>
        </Link>
      </div>
      
      <nav className="space-y-1.5 mb-6">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => getNavItemClasses(isActive)}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {!isConnected ? (
        <Button 
          className="w-full bg-music-primary hover:bg-music-secondary"
          onClick={connectWallet}
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="mt-auto">
          <div className="bg-secondary rounded-lg p-3">
            <div className="font-medium mb-1">Connected Wallet</div>
            <div className="text-sm text-muted-foreground truncate">
              {address && `${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
            </div>
          </div>
        </div>
      )}
      
      <Button 
        className="w-full mt-4 flex items-center"
        variant="outline"
        asChild
      >
        <Link to="/create">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create
        </Link>
      </Button>
    </div>
  );
}
