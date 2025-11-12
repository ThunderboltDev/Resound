"use client";

import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { Avatar, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";
import { useMemo } from "react";

type DicebearAvatarProps = {
  seed: string;
  size?: number;
  className?: string;
  badgeClassName?: string;
  imageUrl?: string;
  badgeImageUrl?: string;
};

export function DicebearAvatar({
  seed,
  size = 32,
  className,
  badgeClassName,
  imageUrl,
  badgeImageUrl,
}: DicebearAvatarProps) {
  const avatarSource = useMemo(() => {
    if (imageUrl) {
      return imageUrl;
    }

    const avatar = createAvatar(glass, {
      seed: seed.toLowerCase().trim(),
      size,
    });

    return avatar.toDataUri();
  }, [seed, size, imageUrl]);

  const badgeSize = Math.round(size / 2);

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <Avatar className={cn("border border-background", className)}>
        <AvatarImage alt="Avatar" src={avatarSource} />
      </Avatar>
      {badgeImageUrl && (
        <div
          className={cn(
            "absolute right-0 bottom-0 flex items-center justify-center overflow-hidden rounded-full border-2 border-background",
            badgeClassName
          )}
          style={{
            width: badgeSize,
            height: badgeSize,
            transform: "translate(15% 15%)",
          }}
        >
          <Image
            alt="Badge"
            className="h-full w-full object-cover"
            src={badgeImageUrl}
            height={badgeSize}
            width={badgeSize}
          />
        </div>
      )}
    </div>
  );
}
