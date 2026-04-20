"use client";

import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

/**
 * A person avatar backed by DiceBear's "initials" style. Deterministic,
 * CDN-served, and fast — when an image URL isn't available we still show
 * the hand-rolled gradient initials fallback.
 */
export function PersonAvatar({
  name,
  seed,
  size = 32,
  className,
}: {
  name: string;
  seed?: string;
  size?: number;
  className?: string;
}) {
  const s = encodeURIComponent(seed ?? name);
  const src = `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${s}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc&scale=90`;
  return (
    <Avatar className={cn("h-8 w-8", className)} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="aspect-square h-full w-full object-cover"
        unoptimized
      />
      <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
