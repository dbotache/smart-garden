import Image from "next/image";
import { SlideLayout } from "../components/SlideLayout";
import { At, Card, IconBadge, type IconName } from "../components/SlidePrimitives";

const CHALLENGES: { icon: IconName; title: string; text: string; x: number; y: number }[] = [
  { icon: "book", title: "Wissenslücken", text: "Pflege kostet viel Zeit, wenn jede Frage erst nachgeschlagen werden muss.", x: 331, y: 0 },
  { icon: "puzzle", title: "Zersplitterte Lösungen", text: "Apps, Sensoren und Bewässerung laufen getrennt voneinander.", x: 611, y: 0 },
  { icon: "eye-slash", title: "Kein Gesamtbild", text: "Es fehlen Prognosen und ein Überblick über den Pflegezustand.", x: 331, y: 166 },
  { icon: "ruler", title: "Aufwendige Neuplanung", text: "Beete anzulegen dauert, und oft stehen unverträgliche Arten nebeneinander.", x: 611, y: 166 },
];

/** PPTX 3 — Problem: persona "Peter" + four challenges. */
export default function Slide04() {
  return (
    <SlideLayout eyebrow="WHY · PROBLEM + CHALLENGES" title="Peter will Gemüse ernten und hat keinen grünen Daumen">
      <At x={0} y={0} w={302} h={173}>
        <Image src="/assets/images/problem-seedlings.jpg" alt="Setzlinge in einer Anzuchtschale" fill sizes="30vw" className="object-cover" />
      </At>
      <At x={0} y={187} w={302} h={101}>
        <blockquote className="font-serif u-fs-18 italic leading-[1.25] text-pw-900">„Ich hätte gern Gemüse und Blumen im eigenen Garten. Ich weiß nur nicht, was wohin gehört und wann es was braucht.“</blockquote>
      </At>
      <At x={0} y={295} w={302} h={22}>
        <p className="u-fs-12 text-pw-muted">Peter, Hobbygärtner (Beispielperson)</p>
      </At>
      {CHALLENGES.map((c) => (
        <At key={c.title} x={c.x} y={c.y} w={262} h={151}>
          <Card className="h-full u-p-16">
            <div className="flex items-center u-gap-10">
              <IconBadge icon={c.icon} size={36} />
              <h3 className="u-fs-17 font-bold leading-tight text-pw-900">{c.title}</h3>
            </div>
            <p className="u-mt-12 u-fs-15 leading-snug text-pw-ink">{c.text}</p>
          </Card>
        </At>
      ))}
    </SlideLayout>
  );
}
