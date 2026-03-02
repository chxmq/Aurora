import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Post, Track } from '../lib/types';
import { getPopulatedPosts, getPopularTracks } from '../services/data';
import { getUsers, getCurrentUser } from '../services/localStorage';

interface DataContextType {
  posts: (Post & { user: User })[];
  popularTracks: Track[];
  suggestedUsers: User[];
  currentUser: User | null;
  refreshData: () => void;
  refreshPosts: () => void;
  refreshUser: () => void;
}

const DataContext = createContext<DataContextType>({
  posts: [],
  popularTracks: [],
  suggestedUsers: [],
  currentUser: null,
  refreshData: () => {},
  refreshPosts: () => {},
  refreshUser: () => {},
});

export const useData = () => useContext(DataContext);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<(Post & { user: User })[]>([]);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const refreshPosts = useCallback(() => {
    try {
      const updatedPosts = getPopulatedPosts();
      if (Array.isArray(updatedPosts)) setPosts(updatedPosts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  }, []);

  const refreshUser = useCallback(() => {
    try {
      setCurrentUser(getCurrentUser());
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const refreshSuggestedUsers = useCallback(
    (excludeId?: string) => {
      try {
        const users = getUsers()
          .sort((a, b) => (b.followers || 0) - (a.followers || 0))
          .filter((u) => u.id !== (excludeId ?? currentUser?.id))
          .slice(0, 5);
        setSuggestedUsers(users);
      } catch (error) {
        console.error('Error refreshing suggested users:', error);
      }
    },
    [currentUser?.id]
  );

  const refreshTracks = useCallback(() => {
    try {
      setPopularTracks(getPopularTracks().slice(0, 5));
    } catch (error) {
      console.error('Error refreshing tracks:', error);
    }
  }, []);

  const refreshData = useCallback(() => {
    refreshUser();
    refreshPosts();
    refreshTracks();
    refreshSuggestedUsers();
  }, [refreshUser, refreshPosts, refreshTracks, refreshSuggestedUsers]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // React to localStorage changes made by other browser tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key.startsWith('sai_music_posts')) refreshPosts();
      if (event.key.startsWith('sai_music_tracks')) refreshTracks();
      if (event.key.startsWith('sai_music_users')) refreshSuggestedUsers();
      if (event.key === 'sai_music_current_user') refreshUser();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshPosts, refreshTracks, refreshSuggestedUsers, refreshUser]);

  return (
    <DataContext.Provider
      value={{
        posts,
        popularTracks,
        suggestedUsers,
        currentUser,
        refreshData,
        refreshPosts,
        refreshUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
