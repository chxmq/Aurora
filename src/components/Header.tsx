import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, Menu, X, Sun, Moon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWallet } from "@/lib/walletUtils";
import { cn } from "@/lib/utils";

export default function Header() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isConnected, connectWallet, address } = useWallet();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isSearchFocused) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchRef.current?.blur();
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [isSearchFocused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-50">
      {/* Mobile Logo & Menu */}
      {isMobile && (
        <>
          <Link to="/" className="flex items-center group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-glow transition-all duration-300 group-hover:shadow-glow-lg group-hover:scale-110">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent font-bold">Aurora</span>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/20 dark:border-gray-700/30 transition-all duration-200 hover:bg-white/20 dark:hover:bg-gray-700/30"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <>
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative group">
              <div className={cn(
                "relative overflow-hidden rounded-2xl transition-all duration-300",
                isSearchFocused 
                  ? "glass shadow-glow ring-2 ring-brand-500/50" 
                  : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80"
              )}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 transition-colors duration-200 group-focus-within:text-brand-500" />
                
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Search tracks, artists, or playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-12 pr-16 py-3 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none text-sm"
                />
                
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex h-6 px-2 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400 items-center gap-1">
                    /
                  </kbd>
                </div>

                {/* Search suggestions overlay */}
                {isSearchFocused && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 animate-scale-in">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent searches</div>
                    <div className="space-y-2">
                      {["Chill Vibes", "Electronic Beats", "Jazz Fusion"].map((suggestion) => (
                        <div
                          key={suggestion}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200"
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 group"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-brand-600 transition-colors duration-200" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-rose rounded-full animate-pulse"></div>
            </Link>

            {/* Wallet Connection */}
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Wallet className="h-4 w-4" />
                Connect
              </Button>
            ) : (
              <div className="glass rounded-2xl px-4 py-2 border border-white/20 dark:border-gray-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {address && `${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                  </span>
                </div>
              </div>
            )}

            {/* Profile */}
            <Link
              to="/profile"
              className="p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 group"
            >
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-brand-600 transition-colors duration-200" />
            </Link>
          </div>
        </>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 animate-scale-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-80 h-full glass p-6 animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative glass rounded-2xl border border-white/20 dark:border-gray-700/30">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-0 focus:outline-none"
                />
              </div>
            </form>

            {/* Mobile Actions */}
            <div className="space-y-4">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span>Toggle Theme</span>
              </button>

              <Link
                to="/notifications"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </div>
                <div className="w-2 h-2 bg-accent-rose rounded-full"></div>
              </Link>

              <Link
                to="/profile"
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>

              {!isConnected ? (
                <Button
                  onClick={() => {
                    connectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              ) : (
                <div className="w-full glass rounded-xl p-3 border border-white/20 dark:border-gray-700/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      {address && `${address.substring(0, 8)}...${address.substring(address.length - 6)}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
