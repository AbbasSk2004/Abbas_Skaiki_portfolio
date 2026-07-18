import React from 'react';

// Static four-cell info row. No interactivity → Server Component.
export const InfoStrip: React.FC = () => {
  const items = [
    { label: "LOCATION", content: "TYRE, LEBANON" },
    { label: "FIELD", content: "FULL-STACK WEB DEVELOPMENT" },
    { label: "APPROACH", content: "AUTOMATING BUSINESS WORKFLOWS" },
    { label: "CLIENTS", content: "B2B & MARKETING TEAMS" }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto border-b border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-4 w-full border-y border-white/10">
        {items.map((item, idx) => {
          // 2x2 on mobile: right border on left column (even index),
          // bottom border on the top row (first two items).
          // 4x1 on desktop: right border on the first three items only.
          const mobileRight = idx % 2 === 0 ? 'border-r' : '';
          const mobileBottom = idx < 2 ? 'border-b' : '';
          const desktopRight = idx < items.length - 1 ? 'md:border-r' : 'md:border-r-0';
          const desktopBottom = 'md:border-b-0';

          return (
            <div
              key={idx}
              className={`p-6 border-white/10 ${mobileRight} ${mobileBottom} ${desktopRight} ${desktopBottom} hover:bg-white/[0.02] transition-colors`}
            >
              <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
                {item.label}
              </div>
              <div className="font-['Space_Grotesk'] text-sm font-medium tracking-wide text-zinc-100 uppercase">
                {item.content}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
