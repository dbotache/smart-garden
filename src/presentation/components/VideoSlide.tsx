"use client";

import Image from "next/image";
import { useSlideMeta } from "./SlideMeta";

type VideoSlideProps = {
  clip: string;
  title: string;
  speed?: number;
  onEnded?: () => void;
};

export function VideoSlide({ clip, title, speed = 1, onEnded }: VideoSlideProps) {
  const { printable } = useSlideMeta();
  const poster = `/assets/videos/${clip}.jpg`;

  if (printable) {
    return <Image src={poster} alt={`Standbild · ${title}`} fill unoptimized className="object-contain" />;
  }

  return (
    <video
      aria-label={title}
      className="h-full w-full object-contain"
      src={`/assets/videos/${clip}.mp4`}
      poster={poster}
      onLoadedMetadata={({ currentTarget }) => {
        currentTarget.defaultPlaybackRate = speed;
        currentTarget.playbackRate = speed;
      }}
      onEnded={onEnded}
      autoPlay
      loop={!onEnded}
      muted
      controls
      playsInline
    />
  );
}
