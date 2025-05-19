
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";

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

  return (
    <div className={`relative ${className}`}>
      <Avatar className={`${sizeClasses[size]}`}>
        <AvatarImage src={src} alt={fallback} />
        <AvatarFallback>{fallback.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      {isVerified && (
        <BadgeCheck
          className={`absolute ${badgeSizes[size]} text-music-primary bg-background rounded-full`}
        />
      )}
    </div>
  );
}
