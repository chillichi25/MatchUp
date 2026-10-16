import { Image } from "expo-image";
import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

function initials(name?: string | null) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ uri, name, size = 44, className }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={dimension}
        contentFit="cover"
        className={cn("bg-slate-100", className)}
        accessibilityLabel={name ? `${name} badge` : "Club badge"}
      />
    );
  }

  return (
    <View
      style={dimension}
      className={cn(
        "items-center justify-center bg-[#E4F9EB]",
        className
      )}
    >
      <Text
        className="font-bold text-[#009F37]"
        style={{ fontSize: size * 0.36 }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
