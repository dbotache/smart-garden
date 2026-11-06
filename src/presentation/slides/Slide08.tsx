import { SlideLayout } from "../components/SlideLayout";
import { pt } from "../components/SlidePrimitives";

const MONTHS = [1, 2, 3, 4, 5, 6];
const ROADMAP = [
  { title: "Mobile Variante", detail: "PlantWiz fürs Smartphone", start: 1, end: 3 },
  { title: "Digitaler Zwilling", detail: "Aus Fotos oder Videos erstellen", start: 2, end: 5 },
  { title: "UX-Verbesserungen", detail: "Planung und Pflege vereinfachen", start: 2, end: 6 },
  { title: "Marktrecherche", detail: "Bedarf und Zahlungsbereitschaft prüfen", start: 1, end: 2 },
  { title: "Skalierbarkeit", detail: "Technik für mehr Nutzer vorbereiten", start: 4, end: 6 },
];

export default function Slide08() {
  return (
    <SlideLayout eyebrow="HOW · ROADMAP" title="Was wir mit PlantWiz als Nächstes vorhaben">
      <table className="w-full table-fixed border-collapse text-left" aria-label="Roadmap über sechs Monate">
        <colgroup>
          <col style={{ width: pt(284) }} />
          {MONTHS.map((month) => <col key={month} />)}
        </colgroup>
        <thead className="bg-pw-900 text-white">
          <tr>
            <th scope="col" className="u-px-12 u-py-8 u-fs-14">Arbeitspaket</th>
            {MONTHS.map((month) => (
              <th key={month} scope="col" className="text-center u-fs-14">Monat {month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROADMAP.map(({ title, detail, start, end }) => (
            <tr key={title} className="border-b border-pw-200 bg-pw-50 even:bg-white" style={{ height: pt(51) }}>
              <th scope="row" className="u-px-12 font-normal">
                <span className="block u-fs-17 font-bold text-pw-900">{title}</span>
                <span className="block u-fs-13 leading-tight text-pw-muted">{detail}</span>
              </th>
              <td colSpan={MONTHS.length} className="p-0">
                <div className="relative grid grid-cols-6" style={{ height: pt(50) }}>
                  {MONTHS.map((month) => (
                    <span key={month} className="row-start-1 border-l border-pw-200" style={{ gridColumn: month }} aria-hidden="true" />
                  ))}
                  <span
                    className="z-10 row-start-1 self-center rounded-full bg-pw-700"
                    style={{ gridColumn: `${start} / ${end + 1}`, height: pt(18), marginInline: pt(3) }}
                    role="img"
                    aria-label={`Monat ${start} bis ${end}`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="u-mt-10 u-fs-13 text-pw-muted">Vorgeschlagener Zeitplan ab Projektstart</p>
    </SlideLayout>
  );
}
