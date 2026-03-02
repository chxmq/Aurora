import { useState, useEffect } from "react";
import { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useWallet } from "@/providers/walletUtils";
import { useData } from "@/providers/DataProvider";
import { getNotificationsForUser, markAllNotificationsRead } from "@/services/localStorage";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isConnected, connectWallet } = useWallet();
  const { currentUser } = useData();

  useEffect(() => {
    if (!isConnected || !currentUser) {
      setNotifications([
        {
          id: "sys-1",
          type: "system",
          toUserId: "",
          content: "Connect your wallet to receive notifications about your music and followers.",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }
    const userNotifs = getNotificationsForUser(currentUser.id);
    setNotifications(userNotifs);
    markAllNotificationsRead(currentUser.id);
  }, [isConnected, currentUser]);

  const renderContent = (n: Notification) => {
    const timeLabel = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });

    if (n.type === "system") {
      return (
        <div className="flex items-center">
          <div className="mr-3 h-10 w-10 bg-music-primary/20 rounded-full flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-music-primary" />
          </div>
          <div className="flex-1">
            <p>{n.content}</p>
            <p className="text-xs text-muted-foreground">{timeLabel}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        {n.fromUser && (
          <div className="mr-3">
            <AvatarWithVerify
              src={n.fromUser.avatar}
              fallback={n.fromUser.displayName}
              isVerified={n.fromUser.isVerified}
              size="md"
            />
          </div>
        )}
        <div className="flex-1">
          <p>{n.content}</p>
          <p className="text-xs text-muted-foreground">{timeLabel}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg ${n.isRead ? "bg-muted/20" : "bg-muted/40"}`}
            >
              {renderContent(n)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-medium mb-2">No notifications yet</h2>
          <p className="text-muted-foreground">
            {isConnected
              ? "When people like, comment, or follow you, you'll see it here."
              : "Connect your wallet to start receiving notifications."}
          </p>
          {!isConnected && (
            <Button variant="outline" className="mt-4" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
