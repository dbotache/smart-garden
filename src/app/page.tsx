import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const cards = [
    { href: "/presentation", title: "Präsentation", text: "Der migrierte Pitch (21 Folien) mit eingebetteter Live-Demo des 3D-Gartens." },
    { href: "/prototype", title: "3D-Prototyp", text: "Der interaktive Garten allein: Planung, Empfehlungen, Sensoren, Bewässerung." },
    { href: "/architecture", title: "Systemarchitektur", text: "Interaktive Infrastruktur in drei Ausbaustufen: Digital, Sensorik, Automatisierung." },
    { href: "/original/index.html", title: "Original-Prototyp", text: "Unveränderte Ausgangsversion zum Vergleich (2D-Canvas)." },
  ];
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center gap-8 px-6 py-12">
      <div className="flex items-center gap-4">
        <Image src="/assets/images/plantwiz-logo.png" alt="" width={56} height={56} className="rounded-xl" />
        <div>
          <h1 className="font-serif text-4xl font-bold text-pw-900">PlantWiz</h1>
          <p className="text-pw-muted">Dein Garten, dein Plan.</p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="block h-full rounded-xl bg-white p-5 shadow-sm ring-1 ring-pw-200 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-pw-700">
              <h2 className="font-serif text-xl text-pw-900">{c.title}</h2>
              <p className="mt-2 text-sm text-pw-muted">{c.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
