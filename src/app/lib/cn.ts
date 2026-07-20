import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Standard shadcn-style class combiner: clsx resolves conditional/array inputs,
// tailwind-merge dedupes conflicting Tailwind utilities (e.g. `px-2 px-4` → `px-4`).
// Both deps already ship in package.json; this is the first place they're wired
// together. Admin UI components use it for variant + conditional styling.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
