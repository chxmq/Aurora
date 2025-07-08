import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Bell, User, BarChart3, PlusCircle, TrendingUp, Plus, Database, Music, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/walletUtils";
import { useState } from "react";

const navItems = [
  { to: "/", icon: Home, label: "Home", primary: true },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/viral-sounds", icon: TrendingUp, label: "Viral Sounds" },
  { to: "/create", icon: Plus, label: "Create" },
];

const secondaryItems = [
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

const collections = [
  { label: "Liked Songs", icon: Heart, count: 42 },
  { label: "My Playlists", icon: Music, count: 8 },
];

export default function Sidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isConnected, connectWallet, address } = useWallet();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
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
          {navItems.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                cn(
                  "flex flex-col items-center justify-center w-16 h-full",
                  isActive ? "text-music-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className={cn("h-5 w-5 mb-1", isActive ? "text-music-primary" : "text-muted-foreground")} />
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
    <aside className="h-full p-6 flex flex-col">
      {/* Logo Section */}
      <div className="mb-8 animate-fade-up">
        <Link to="/" className="flex items-center group">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-glow transition-all duration-300 group-hover:shadow-glow-lg group-hover:scale-110">
                <img 
                  src="/images/aurora-logo.png" 
                  alt="Aurora" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-emerald rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                Aurora
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Music Platform
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-2 mb-8 animate-fade-up delay-100">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
          Discover
        </div>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              onMouseEnter={() => setHoveredItem(item.to)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
                "hover:scale-105 transform-gpu",
                active 
                  ? "bg-gradient-to-r from-brand-500/20 to-brand-600/20 text-brand-700 dark:text-brand-300 shadow-lg" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Background glow effect */}
              {(active || hoveredItem === item.to) && (
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-brand-600/10 rounded-2xl animate-scale-in"></div>
              )}
              
                             <div className={cn(
                 "relative z-10 p-2 rounded-xl transition-all duration-300",
                 active ? "bg-brand-500/20" : "group-hover:bg-white/20 dark:group-hover:bg-gray-700/20"
               )}>
                 <Icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
               </div>
              
              <span className={cn(
                "font-medium transition-all duration-300 relative z-10",
                active ? "text-brand-700 dark:text-brand-300 font-semibold" : "group-hover:translate-x-1"
              )}>
                {item.label}
              </span>

              {/* Active indicator */}
              {active && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collections */}
      <div className="mb-8 animate-fade-up delay-200">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
          Your Music
        </div>
        <div className="space-y-1">
          {collections.map((collection, index) => {
            const Icon = collection.icon;
            return (
              <div 
                key={collection.label}
                className="group flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 cursor-pointer"
                style={{
                  animationDelay: `${(index + 4) * 50}ms`
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">{collection.label}</span>
                </div>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full font-medium group-hover:bg-brand-100 dark:group-hover:bg-brand-900/20 transition-colors duration-200">
                  {collection.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="space-y-1 mb-8 animate-fade-up delay-300">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
          Account
        </div>
        {secondaryItems.map((item, index) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                active 
                  ? "bg-brand-500/10 text-brand-700 dark:text-brand-300" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-gray-800/30"
              )}
              style={{
                animationDelay: `${(index + 6) * 50}ms`
              }}
            >
              <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
