
import { Button } from "@/components/ui/button";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { User } from "@/lib/types";
import { Link } from "react-router-dom";

interface SuggestedFollowsProps {
  users: User[];
}

export default function SuggestedFollows({ users }: SuggestedFollowsProps) {
  return (
    <div className="bg-secondary/50 rounded-xl p-4">
      <h2 className="font-semibold mb-4">Suggested Follows</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <Link to={`/profile/${user.id}`} className="flex items-center">
              <AvatarWithVerify
                src={user.avatar}
                fallback={user.displayName}
                isVerified={user.isVerified}
                size="sm"
                className="mr-3"
              />
              <div>
                <p className="font-medium text-sm">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {user.followers} {user.followers === 1 ? 'follower' : 'followers'}
                </p>
              </div>
            </Link>
            <Button variant="outline" size="sm" className="h-8">
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
