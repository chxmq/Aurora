
import { useState } from "react";
import Layout from "@/components/Layout";
import { mockUsers } from "@/lib/mockData";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  const [allUsers] = useState(mockUsers);
  const [featuredUsers] = useState([...mockUsers].sort(() => Math.random() - 0.5));
  
  // Add additional mock users for the grid
  const exploreUsers = [
    ...allUsers,
    
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Explore</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Featured Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredUsers.slice(0, 4).map((user) => (
            <Link 
              key={user.id} 
              to={`/profile/${user.id}`}
              className="bg-secondary/50 rounded-lg p-4 hover:bg-secondary/70 transition"
            >
              <div className="flex flex-col items-center text-center">
                <AvatarWithVerify
                  src={user.avatar}
                  fallback={user.displayName}
                  isVerified={user.isVerified}
                  size="lg"
                  className="mb-3"
                />
                <h3 className="font-semibold">{user.displayName}</h3>
                <p className="text-sm text-muted-foreground">{user.username}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user.followers} {user.followers === 1 ? 'follower' : 'followers'}
                </p>
                
                <Button variant="outline" size="sm" className="mt-3">
                  Follow
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Explore All</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {exploreUsers.map((user) => (
            <Link 
              key={user.id} 
              to={`/profile/${user.id}`}
              className="bg-music-primary/20 hover:bg-music-primary/30 rounded-lg p-4 aspect-square flex flex-col items-center justify-center transition"
            >
              <h3 className="font-semibold text-center">{user.displayName}</h3>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
