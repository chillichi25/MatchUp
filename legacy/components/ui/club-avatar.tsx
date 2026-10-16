import Image from "next/image";
import { Shield } from "lucide-react";

type ClubAvatarProps = {
  clubName: string;
  badgeUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

export function ClubAvatar({
  clubName,
  badgeUrl,
  size = "md",
}: ClubAvatarProps) {
  const sizes = {
    sm: "h-16 w-16",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  if (badgeUrl) {
    return (
      <div
        className={`${sizes[size]} relative shrink-0`}
      >
        <Image
          src={badgeUrl}
          alt={`${clubName} badge`}
          fill
          sizes="80px"
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center`}
    >
      <Shield
        className="h-7 w-7 text-slate-400"
        strokeWidth={1.8}
      />
    </div>
  );
}