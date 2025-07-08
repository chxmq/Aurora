import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";
import { getGatewayUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarWithVerifyProps {
  src: string;
  fallback: string;
  isVerified?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function AvatarWithVerify({
  src,
  fallback,
  isVerified = false,
  size = "md",
  className,
}: AvatarWithVerifyProps) {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const badgeSizes = {
    xs: "h-3 w-3 -bottom-0.5 -right-0.5",
    sm: "h-4 w-4 -bottom-1 -right-1",
    md: "h-5 w-5 -bottom-1 -right-1",
    lg: "h-6 w-6 -bottom-1 -right-1",
  };

  const avatarSrc = getGatewayUrl(src);

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn(sizeClasses[size], "ring-0 border-0 bg-transparent")}>
        <AvatarImage 
          src={avatarSrc} 
          alt={fallback}
          className="object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('/placeholder.svg')) {
              target.src = '/placeholder.svg';
            }
          }}
        />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold border-0">
          {fallback.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {isVerified && (
        <BadgeCheck
          className={cn(
            "absolute text-blue-500 bg-background rounded-full border border-background shadow-sm",
            badgeSizes[size]
          )}
        />
      )}
    </div>
  );
}
