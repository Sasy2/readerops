import type { ReactNode } from "react";

/**
 * iOS inset grouped section (HIG lists-and-tables.md): an optional header, white rows with
 * hairline separators, and an optional footer note.
 */
export function Group({ header, footer, children }: { header?: string; footer?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      {header && <h2 className="px-4 text-footnote text-label-secondary">{header}</h2>}
      <div className="divide-y divide-separator/70 overflow-hidden rounded-[var(--radius-card)] bg-card">{children}</div>
      {footer && <p className="px-4 text-footnote text-label-secondary">{footer}</p>}
    </section>
  );
}

/** One row of a Group: at least 44px tall, content laid out left to right. */
export function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex min-h-11 items-center gap-3 px-4 py-2.5 ${className}`}>{children}</div>;
}
