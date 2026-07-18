import React from 'react';

// Static site-wide backdrop: faint grid + decorative corner crosshairs. No
// interactivity, so this stays a Server Component.
export const GridBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100 overflow-x-clip font-sans">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      >
        {/* Crosshairs could be added by mapping, but doing it via CSS is cleaner.
            For exact crosshairs at intersections, we can use a repeating radial gradient or SVGs.
            A simpler method is to just rely on the grid for the main lines and place a few decorative + signs. */}
      </div>

      {/* Crosshairs overlay — desktop only; on mobile they'd drift into cell content */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
         <div className="absolute top-[100px] left-[100px] text-white/20 text-xs font-mono translate-x-[-50%] translate-y-[-50%]">+</div>
         <div className="absolute top-[100px] right-[100px] text-white/20 text-xs font-mono translate-x-[-50%] translate-y-[-50%]">+</div>
         <div className="absolute bottom-[100px] left-[100px] text-white/20 text-xs font-mono translate-x-[-50%] translate-y-[-50%]">+</div>
         <div className="absolute bottom-[100px] right-[100px] text-white/20 text-xs font-mono translate-x-[-50%] translate-y-[-50%]">+</div>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
