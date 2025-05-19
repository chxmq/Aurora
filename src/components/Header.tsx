import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, User, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWallet } from "@/lib/walletUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SearchResults from "@/components/SearchResults";
import { searchContent } from "@/lib/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const isMobile = useIsMobile();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], tracks: [], posts: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { isConnected, connectWallet, disconnectWallet, address, balance } = useWallet();
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Debounced search with loading state
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const results = searchContent(searchQuery);
        setSearchResults(results);
        setIsSearchOpen(true);
        setIsSearching(false);
      }, 300);
      
      return () => {
        clearTimeout(timer);
        setIsSearching(false);
      };
    } else {
      setIsSearchOpen(false);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim().length > 2) {
      setIsSearchOpen(true);
    }
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };
  
  const handleSearchClear = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };
  
  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b z-20 flex items-center px-4">
      <div className={`flex items-center justify-between w-full ${!isMobile ? 'ml-60' : ''}`}>
        {isMobile && (
          <Link to="/" className="flex items-center font-bold text-xl">
            <span className="text-music-primary">MUSIC</span>
            <span>NFT</span>
          </Link>
        )}

        <div className={`relative ${isMobile ? 'flex-1 mx-4' : 'flex-1 max-w-lg'}`}>
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <div className={`
                flex items-center 
                bg-muted/50 
                rounded-full 
                px-4 py-2 
                transition-all duration-300 ease-in-out
                ${isSearchFocused ? 'ring-1 ring-music-primary shadow-sm scale-[1.02]' : 'hover:bg-muted/70 hover:scale-[1.01]'}
                transform-gpu
              `}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-music-primary" />
                ) : (
                  <Search className={`
                    h-4 w-4 
                    mr-2 
                    transition-colors duration-300
                    ${isSearchFocused ? 'text-music-primary' : 'text-muted-foreground'}
                  `} />
                )}
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search for artists, tracks, or posts"
                  className="
                    flex-1
                    bg-transparent 
                    border-none 
                    focus:outline-none 
                    text-sm
                    placeholder:text-muted-foreground/70
                    text-foreground
                    w-full
                    transition-all duration-300
                    placeholder:transition-opacity
                    focus:placeholder:opacity-50
                  "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 hover:bg-muted/80 rounded-full ml-1 transition-colors duration-200"
                    onClick={handleSearchClear}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[90vw] md:w-[600px] p-0 mt-2 border-muted overflow-hidden rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95" 
              align="start"
            >
              <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-music-primary/20 scrollbar-track-muted hover:scrollbar-thumb-music-primary/30 scroll-smooth">
                <div className="sticky top-0 bg-popover/80 backdrop-blur-sm p-3 border-b border-muted">
                  <p className="text-sm text-muted-foreground">
                    {isSearching ? (
                      "Searching..."
                    ) : searchQuery.length > 2 ? (
                      `Results for "${searchQuery}"`
                    ) : (
                      "Start typing to search"
                    )}
                  </p>
                </div>
                <div className="p-4">
                  <SearchResults results={searchResults} onClose={closeSearch} />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && !isConnected && (
            <Button 
              className="bg-music-primary hover:bg-music-secondary"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}

          {isConnected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  {address && `${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                </DropdownMenuLabel>
                
                {balance && (
                  <DropdownMenuLabel className="font-normal text-xs">
                    Balance: {balance} ETH
                  </DropdownMenuLabel>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={disconnectWallet} className="text-red-500">
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
