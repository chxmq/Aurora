
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MusicPlayer from "./MusicPlayer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!isMobile && <Sidebar />}
      
      <main className={`pt-16 ${isMobile ? 'pb-36' : 'pb-24 ml-60'}`}>
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
      
      <MusicPlayer minimized={isMobile} />
      {isMobile && <div className="h-16"></div>} {/* Space for bottom navigation */}
    </div>
  );
}
