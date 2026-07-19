import { getDrivenResults } from '@/api/public/drivenResults';
import { DrivenResultsGrid, type Metric } from './DrivenResultsGrid';

// The headline copy is presentation, not data — it never varied per record and
// was never seeded, so it stays here in the component.
const HEADLINE =
  "THE WORK DOESN'T JUST LOOK GOOD — IT PERFORMS. HERE'S THE IMPACT BEHIND THE DESIGN.";

// Server Component: fetches the impact metrics from the Express API (1-hour ISR
// via getDrivenResults) and hands plain data to the client grid, where the
// framer-motion count-up animation lives. Splitting this way keeps `revalidate`
// working while preserving the client-only AnimatedCounter.
export const DrivenResultsSection: React.FC = async () => {
  const results = await getDrivenResults();

  // Map the API document onto the shape the grid renders. `value` -> num;
  // prefix is prepended to the suffix slot only if present (the design shows a
  // trailing glyph, so a prefix like "$" is rendered ahead of the number).
  const metrics: Metric[] = results.map((r) => ({
    num: r.value,
    prefix: r.prefix ?? '',
    suffix: r.suffix ?? '',
    label: r.label,
    desc: r.description ?? '',
  }));

  return (
    <section id="results" className="w-full bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto border-b border-white/10">

        {/* Top Block (The Headline Row) */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Pane */}
          <div className="col-span-1 md:col-span-4 border-b md:border-b-0 md:border-r border-white/10 p-6 md:p-12 flex flex-col">
            <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
              • DRIVEN RESULTS
            </div>
            {/* The rest is intentionally clean and negative-space driven */}
          </div>

          {/* Right Pane */}
          <div className="col-span-1 md:col-span-8 p-6 md:p-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.1] font-['Space_Grotesk'] text-white">
              {HEADLINE}
            </h2>
          </div>
        </div>

        {/* Bottom Block (The Metric Grid) — client component owns the count-up */}
        <DrivenResultsGrid metrics={metrics} />

      </div>
    </section>
  );
};
