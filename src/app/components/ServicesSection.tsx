'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

// Vite-ism removed: assets in public/ are served from the root, so we reference
// the service hero by its public path string instead of importing it.
const heroImage = '/assets/service.png';

const services = [
  {
    index: "01/",
    title: "FULL-STACK DEVELOPMENT",
    desc: "Architecting responsive, high-performing websites and complex web applications built on secure, modular, and modern backend logic.",
    tags: ["NEXT.JS", "REACT", "NODE.JS", "EXPRESS", "MONGODB", "POSTGRESQL", "ANGULAR"],
    hoverImg: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    index: "02/",
    title: "AI INTEGRATION",
    desc: "Deploying custom AI models, agentic workflows, and LLM orchestration layers to automate complex business processes and scale organizational intelligence.",
    tags: ["AI AGENTS", "AUTOMATION", "LLMS", "WORKFLOWS", "API PIPELINES"],
    hoverImg: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop"
  },
  {
    index: "03/",
    title: "MOBILE DEVELOPMENT",
    desc: "Engineering fluid, native-grade iOS and Android mobile applications powered by scalable architectures for uninterrupted cross-platform performance.",
    tags: ["REACT NATIVE", "CROSS-PLATFORM", "IOS", "ANDROID", "UX"],
    hoverImg: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    index: "04/",
    title: "POS & SAAS PLATFORMS",
    desc: "Designing complex multi-tenant Software-as-a-Service environments and enterprise-grade Point of Sale architectures optimized for high transaction throughput.",
    tags: ["SAAS", "POS", "ENTERPRISE", "SECURITY", "MULTI-TENANT"],
    hoverImg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
  }
];

export const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="w-full bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto border-x border-b border-white/10">

        {/* Unified Top Block: Title + Quote (left) / Image (right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/10">
          {/* Left Column (Title & Quote) */}
          <div className="md:col-span-8 flex flex-col md:border-r border-white/10">
            {/* Top Sub-block (Title) */}
            <div className="p-8 md:p-12">
              <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-12">
                • SERVICES
              </div>
              <h2 className="font-['Space_Grotesk'] text-[clamp(2.5rem,5vw,4.5rem)] font-bold uppercase tracking-tight leading-[1] text-white text-balance">
                <span className="text-zinc-600">DESIGN</span> THAT SPEAKS<br className="hidden md:block" /> FOR YOU
              </h2>
            </div>

            {/* Bottom Sub-block (Quote) */}
            <div className="p-8 md:p-12 border-t border-white/10 flex-grow flex items-end">
              <p className="max-w-md text-balance text-sm font-mono tracking-wide leading-relaxed text-zinc-400">
                "I HELP BRANDS AND STARTUPS CREATE DIGITAL EXPERIENCES THAT FEEL CLEAR, MODERN, AND EFFORTLESS TO USE."
              </p>
            </div>
          </div>

          {/* Right Column (The Image) */}
          <div className="md:col-span-4 relative min-h-[300px] md:min-h-full border-t md:border-t-0 border-white/10">
            <Image
              src={heroImage}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
              alt="Service workspace"
            />
          </div>
        </div>

        {/* 4 Service Rows Matrix */}
        <div className="flex flex-col border-t border-white/10">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 w-full min-h-[160px] py-8 px-6 md:px-8 items-center border-b border-white/10 last:border-b-0 group hover:bg-white/[0.02] transition-colors relative"
            >
              {/* Index */}
              <div className="col-span-1 md:col-span-1 text-zinc-500 font-mono text-sm mb-4 md:mb-0">
                {service.index}
              </div>

              {/* Title & Description */}
              <div className="col-span-1 md:col-span-5 flex flex-col mb-6 md:mb-0 pr-4">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white mb-2 font-['Space_Grotesk'] group-hover:text-red-500 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-[400px] font-['Inter']">
                  {service.desc}
                </p>
              </div>

              {/* Badges / Tags */}
              <div className="col-span-1 md:col-span-3 flex flex-wrap gap-2 pr-4 mb-6 md:mb-0">
                {service.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 border border-white/10 rounded-full font-mono text-[10px] tracking-wider text-zinc-400 bg-white/[0.02] group-hover:border-white/20 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hover Media Preview */}
              <div className="col-span-1 md:col-span-3 flex md:justify-end items-center">
                <div className="hidden md:flex w-32 h-20 border border-white/10 bg-zinc-900 rounded overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-4 group-hover:translate-x-0 relative">
                  <Image src={service.hoverImg} alt="Preview" fill sizes="128px" className="object-cover grayscale opacity-80" />
                </div>
                <div className="md:hidden flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mt-4">
                  Explore <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
