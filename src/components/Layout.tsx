import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MusicPlayer from "./MusicPlayer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

export const Layout = () => {
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-all duration-700">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-400/20 to-brand-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-violet-400/15 to-purple-600/15 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-2xl animate-bounce-gentle"></div>
      </div>

      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <div className="fixed left-0 top-0 z-40 h-screen">
          <div className="h-full w-64 glass-card border-r border-white/10 dark:border-gray-800/50 backdrop-blur-xl animate-slide-in-left">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`fixed top-0 ${isMobile ? 'left-0' : 'left-64'} right-0 z-30 transition-all duration-300 ${
        isScrolled ? 'glass backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}>
        <Header />
      </div>

      {/* Main Content */}
      <div className={`${isMobile ? '' : 'ml-64'} pt-16 pb-24 min-h-screen relative z-10`}>
        <main className="transition-apple-slow animate-fade-up">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Music Player - Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isMobile ? '' : 'ml-64'} glass backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30 animate-slide-in-right`}>
          <MusicPlayer />
        </div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-brand-400/30 rounded-full animate-bounce-gentle`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobile && (
        <div className="fixed inset-x-0 bottom-20 z-40 px-4 pointer-events-none">
          <div className="glass-nav mx-auto max-w-sm px-6 py-3 pointer-events-auto animate-scale-in">
            <div className="flex justify-center">
              <span className="text-sm font-medium text-muted-safe">
                Swipe up for navigation
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
