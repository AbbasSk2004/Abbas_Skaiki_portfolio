import { getTechStacks } from '@/api/public/techStack';
import { ExpertiseMarquee, type ExpertiseCard } from './ExpertiseMarquee';

// Server Component: fetches the expertise/tech categories from the Express API
// (1-hour ISR via getTechStacks) and hands plain, serializable cards to the
// client marquee, where the drag + auto-scroll animation lives. The lucide icon
// is passed as a NAME string and mapped to a component inside the client child.
//
// Exported as `ExpertiseSection` (the name page.tsx imports) even though the
// file is AboutSection.tsx — kept as-is to avoid touching the import site.
export const ExpertiseSection: React.FC = async () => {
  const techStacks = await getTechStacks();

  // Map API documents onto the marquee's card shape. `category` -> title,
  // `icon` -> icon name, `description` -> desc. Sorted by `order` so the
  // marquee sequence matches the intended design order regardless of fetch order.
  const items: ExpertiseCard[] = [...techStacks]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t) => ({
      icon: t.icon ?? '',
      title: t.category,
      desc: t.description ?? '',
    }));

  return (
    <section id="expertise" className="relative overflow-hidden bg-[#050505]">
      <div className="max-w-7xl mx-auto border-b border-white/10">

        {/* Header Block */}
        <div className="p-6 md:p-12 border-b border-white/10">
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            • EXPERTISE & STACK
          </div>
        </div>

        {/* Marquee Container — client component owns the drag/auto-scroll */}
        <ExpertiseMarquee items={items} />

      </div>
    </section>
  );
};
