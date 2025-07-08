import React from "react";
import { Link } from "react-router-dom";
import { Play, Heart, Share, TrendingUp, Music, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockTracks, mockPosts } from "@/lib/mockData";
import { getGatewayUrl } from "@/lib/utils";
import MusicTrackCard from "@/components/MusicTrackCard";
import PostCard from "@/components/PostCard";
import { cn } from "@/lib/utils";

export default function Index() {
  const featuredTracks = mockTracks.slice(0, 6);
  const recentPosts = mockPosts.slice(0, 3);

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-purple-700 p-8 md:p-12 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
              Welcome to <span className="text-glow">Aurora</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 font-light">
              Discover, create, and share music on the decentralized web. Powered by blockchain and IPFS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Link to="/explore">Explore Music</Link>
              </Button>
              <Button asChild className="bg-transparent hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-2xl backdrop-blur-md border border-white/30 hover:border-white/40 transition-all duration-300">
                <Link to="/create">Upload Track</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-8 right-16 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-bounce-gentle"></div>
      </section>

      {/* Stats Section */}
      <section className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 via-violet-50/30 to-purple-50/50 dark:from-brand-950/30 dark:via-violet-950/20 dark:to-purple-950/30 rounded-3xl"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Mock data label */}
        <div className="relative z-20 px-8 pt-6 pb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">*Stats shown are mock data for demo purposes</span>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          {[
            { 
              icon: Music, 
              label: "Total Tracks", 
              value: "2.4K+", 
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-500/10 to-cyan-500/10",
              shadowColor: "shadow-blue-500/20"
            },
            { 
              icon: Users, 
              label: "Active Artists", 
              value: "180+", 
              color: "from-emerald-500 to-teal-500",
              bgColor: "from-emerald-500/10 to-teal-500/10",
              shadowColor: "shadow-emerald-500/20"
            },
            { 
              icon: Zap, 
              label: "Monthly Streams", 
              value: "45K+", 
              color: "from-violet-500 to-purple-500",
              bgColor: "from-violet-500/10 to-purple-500/10",
              shadowColor: "shadow-violet-500/20"
            }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="group relative overflow-hidden"
            >
              {/* Card container with hover effects */}
              <div className={cn(
                "relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
                "border border-white/20 dark:border-gray-800/50 rounded-3xl p-8",
                "shadow-xl hover:shadow-2xl transition-all duration-500",
                "hover:scale-105 transform-gpu cursor-pointer",
                "animate-fade-up",
                stat.shadowColor
              )}
              style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Background gradient overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100",
                  "transition-all duration-500 rounded-3xl",
                  stat.bgColor
                )} />
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon with enhanced styling */}
                  <div className="relative mx-auto mb-6">
                    <div className={cn(
                      "w-20 h-20 bg-gradient-to-br rounded-3xl flex items-center justify-center",
                      "shadow-lg group-hover:shadow-xl transition-all duration-500",
                      "group-hover:scale-110 transform-gpu",
                      stat.color
                    )}>
                      <stat.icon className="h-10 w-10 text-white drop-shadow-sm" />
                    </div>
                    
                    {/* Floating animation elements */}
                    <div className={cn(
                      "absolute -top-2 -right-2 w-6 h-6 rounded-full",
                      "bg-gradient-to-r opacity-0 group-hover:opacity-100",
                      "animate-bounce transition-all duration-500 delay-200",
                      stat.color
                    )} />
                  </div>
                  
                  {/* Value with gradient text */}
                  <div className={cn(
                    "text-4xl md:text-5xl font-bold mb-3 transition-all duration-500",
                    "bg-gradient-to-r bg-clip-text text-transparent",
                    "group-hover:scale-110 transform-gpu",
                    stat.color
                  )}>
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-muted-safe font-medium text-lg group-hover:text-secondary-safe transition-colors duration-300">
                    {stat.label}
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full bg-gradient-to-r rounded-full transition-all duration-1000 delay-300",
                        stat.color
                      )}
                      style={{ 
                        width: index === 0 ? '85%' : index === 1 ? '72%' : '91%',
                        animationDelay: `${index * 200 + 500}ms`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tracks */}
      <section className="animate-fade-up delay-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-safe mb-2">
              Featured Tracks
            </h2>
            <p className="text-muted-safe">
              Discover the most popular tracks on Aurora
            </p>
          </div>
          <Button asChild variant="outline" className="btn-ghost">
            <Link to="/explore">
              View All
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTracks.map((track, index) => (
            <div
              key={track.id}
              className="animate-fade-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <MusicTrackCard track={track} />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="animate-fade-up delay-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-safe mb-2">
              Community Highlights
            </h2>
            <p className="text-muted-safe">
              Latest posts from the Aurora community
            </p>
          </div>
          <Button asChild variant="outline" className="btn-ghost">
            <Link to="/explore">
              View All Posts
              <Share className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           {recentPosts.map((post, index) => (
             <div
               key={post.id}
               className="animate-fade-up"
               style={{ animationDelay: `${(index + 6) * 100}ms` }}
             >
               <PostCard post={{...post, user: post.user!}} />
             </div>
           ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="card-glass p-8 md:p-12 text-center animate-fade-up delay-400">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-safe mb-4">
            Ready to Share Your Music?
          </h2>
          <p className="text-lg text-muted-safe mb-8">
            Join thousands of artists sharing their music on the decentralized web. 
            Upload your tracks and start earning from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="btn-primary">
              <Link to="/create">
                <Music className="mr-2 h-4 w-4" />
                Upload Your First Track
              </Link>
            </Button>
            <Button asChild variant="outline" className="btn-ghost">
              <Link to="/profile">
                Set Up Profile
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
