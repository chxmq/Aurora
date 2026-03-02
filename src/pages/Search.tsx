import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { searchContent } from "@/services/data";
import { getUsers } from "@/services/localStorage";
import SearchResults from "@/components/search/SearchResults";
import { User } from "@/lib/types";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [results, setResults] = useState<{
    users: User[];
    tracks: ReturnType<typeof searchContent>["tracks"];
    posts: ReturnType<typeof searchContent>["posts"];
  }>({ users: [], tracks: [], posts: [] });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], tracks: [], posts: [] });
      return;
    }
    const raw = searchContent(query);
    // Populate post users
    const allUsers = getUsers();
    const posts = raw.posts.map(p => ({
      ...p,
      user: allUsers.find(u => u.id === p.userId),
    }));
    setResults({ users: raw.users, tracks: raw.tracks, posts: posts as typeof raw.posts });
  }, [query]);

  const isEmpty = !results.users.length && !results.tracks.length && !results.posts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SearchIcon className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
      </div>

      {!query ? (
        <div className="text-center py-20 text-muted-foreground">
          <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Type something in the search bar above</p>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-20 text-muted-foreground">
          <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No results for "{query}"</p>
          <p className="text-sm mt-2">Try a different search term</p>
        </div>
      ) : (
        <SearchResults results={results} />
      )}
    </div>
  );
}
