import type { ReactNode } from 'react';

/** Envuelve una etiqueta y muestra una explicación corta al pasar el cursor (o al tocar, en móvil). */
export default function InfoTip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex cursor-help items-center border-b border-dotted border-ink-700">
      {children}
      <span
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 w-56 -translate-x-1/2 rounded border
          border-panel-border bg-deep-800 p-2 text-[11px] font-normal leading-snug text-ink-300 opacity-0 shadow-lg
          transition-opacity duration-100 group-hover/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
