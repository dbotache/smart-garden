"use client";

import { useState } from "react";
import { VideoSlide } from "../components/VideoSlide";

const CLIPS = [
  { clip: "pflegekalender", title: "Pflegekalender" },
  { clip: "pflanzenvertraeglichkeit", title: "Pflanzenverträglichkeit" },
  { clip: "ki-scan-erkennung-chat", title: "KI-Scan, Erkennung und Chat" },
  { clip: "bienenfreundlichkeit", title: "Bienenfreundlichkeit" },
];

export default function Slide06() {
  const [index, setIndex] = useState(0);
  const current = CLIPS[index]!;

  return (
    <VideoSlide
      key={current.clip}
      {...current}
      speed={2}
      onEnded={() => setIndex((previous) => (previous + 1) % CLIPS.length)}
    />
  );
}
