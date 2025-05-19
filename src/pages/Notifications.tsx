
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { getUserNotifications } from "@/lib/mockData";
import { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { AvatarWithVerify } from "@/components/ui/avatar-with-verify";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useWallet } from "@/lib/walletUtils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected } = useWallet();

  useEffect(() => {
    // In a real app, we'd fetch notifications for the current user
    // Here we'll just use mock data
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Simulate API call latency
        await new Promise(resolve => setTimeout(resolve, 500));
        const userNotifications = getUserNotifications('1');
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchNotifications();
    } else {
      setNotifications([
        {
          id: '1',
          type: 'system',
          toUserId: '1',
          content: 'GM frens! Get email notifications on new drops',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]);
      setIsLoading(false);
    }
  }, [isConnected]);

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return (
          <div className="flex items-center">
            <div className="mr-3">
              {notification.fromUser && (
                <AvatarWithVerify
                  src={notification.fromUser.avatar}
                  fallback={notification.fromUser.displayName}
                  isVerified={notification.fromUser.isVerified}
                  size="md"
                />
              )}
            </div>
            <div className="flex-1">
              <p>{notification.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      case 'comment':
        return (
          <div className="flex items-center">
            <div className="mr-3">
              {notification.fromUser && (
                <AvatarWithVerify
                  src={notification.fromUser.avatar}
                  fallback={notification.fromUser.displayName}
                  isVerified={notification.fromUser.isVerified}
                  size="md"
                />
              )}
            </div>
            <div className="flex-1">
              <p>{notification.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="flex items-center">
            <div className="mr-3">
              <div className="h-10 w-10 bg-music-primary/20 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-music-primary" />
              </div>
            </div>
            <div className="flex-1">
              <p>{notification.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Subscribe
            </Button>
          </div>
        );
      default:
        return <p>{notification.content}</p>;
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse-slow">Loading notifications...</div>
        </div>
      ) : (
        <>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg ${notification.isRead ? 'bg-secondary/20' : 'bg-secondary/50'}`}
                >
                  {renderNotificationContent(notification)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-medium mb-2">No notifications yet</h2>
              <p className="text-muted-foreground">
                When you receive notifications, they'll appear here.
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
