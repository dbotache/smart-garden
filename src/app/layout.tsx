import type { Metadata } from "next";
import { Carlito, Noto_Serif } from "next/font/google";
import "./globals.css";

const serif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-noto-serif", display: "swap" });
const sans = Carlito({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-carlito", display: "swap" });

export const metadata: Metadata = {
  title: "PlantWiz · Smart Garden",
  description: "Interaktiver 3D-Gartenprototyp und Präsentation – StartUp Hack Nordhessen",
  icons: { icon: "/assets/images/plantwiz-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
