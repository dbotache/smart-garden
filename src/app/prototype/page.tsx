import type { Metadata } from "next";
import { Suspense } from "react";
import { PrototypeApp } from "./PrototypeApp";

export const metadata: Metadata = { title: "PlantWiz · 3D smart-garden prototype" };

export default function PrototypePage() {
  return (
    <Suspense>
      <PrototypeApp />
    </Suspense>
  );
}
