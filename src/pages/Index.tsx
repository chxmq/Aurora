import React from "react";
import { Link } from "react-router-dom";
import { Play, Heart, Share, TrendingUp, Music, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockTracks, mockPosts } from "@/lib/mockData";
import { getGatewayUrl } from "@/lib/utils";
import MusicTrackCard from "@/components/MusicTrackCard";
import PostCard from "@/components/PostCard";

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
              <Button asChild className="btn-primary bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Link to="/explore">Explore Music</Link>
              </Button>
              <Button asChild variant="outline" className="btn-ghost border-white/30 text-white hover:bg-white/10">
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Music, label: "Total Tracks", value: "2.4K+", color: "from-blue-500 to-cyan-500" },
          { icon: Users, label: "Active Artists", value: "180+", color: "from-emerald-500 to-teal-500" },
          { icon: Zap, label: "Monthly Streams", value: "45K+", color: "from-violet-500 to-purple-500" }
        ].map((stat, index) => (
          <div 
            key={stat.label}
            className="card-glass p-6 text-center animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow`}>
              <stat.icon className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
            <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Featured Tracks */}
      <section className="animate-fade-up delay-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Tracks
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Community Highlights
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Share Your Music?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
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
