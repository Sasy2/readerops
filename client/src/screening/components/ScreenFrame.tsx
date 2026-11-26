import type { ReactNode } from "react";

/** Who is holding the phone on this screen. The background says it before any words do. */
export type Holder = "distributor" | "customer" | "handover";

const FRAME: Record<Holder, string> = {
  distributor: "bg-grouped text-label", // iOS grouped background with white cards
  customer: "bg-card text-label", // plain white, like the test area
  handover: "bg-accent text-white", // full-screen blue: pass the phone
};

const HOLDER_LABEL: Record<Holder, string> = {
  distributor: "Distributor",
  customer: "Customer",
  handover: "Pass the phone",
};

/**
 * Layout for every screening screen, shaped like an iOS navigation bar with a large title:
 * step indicator on top (S-17), content in the middle, actions pinned to the bottom where
 * thumbs reach them.
 */
export function ScreenFrame({
  holder,
  step,
  totalSteps,
  title,
  subtitle,
  children,
  bleed,
  actions,
}: {
  holder: Holder;
  /** Omit on screens outside the numbered flow (e.g. the summary). */
  step?: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  /** Full-width content with no side padding, e.g. the calibration outline that must touch the screen edge. */
  bleed?: ReactNode;
  actions?: ReactNode;
}) {
  const handover = holder === "handover";
  return (
    <main className={`flex min-h-dvh flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${FRAME[holder]}`}>
      <header className="mx-auto flex h-11 w-full max-w-lg items-center justify-between px-4 text-subhead">
        <span className={handover ? "text-white/85" : "text-label-secondary"}>
          {step ? `Step ${step} of ${totalSteps}` : "Near vision screening"}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-footnote font-semibold ${handover ? "bg-white/20 text-white" : "bg-accent-tint text-accent"}`}
        >
          {HOLDER_LABEL[holder]}
        </span>
      </header>

      <div className={`mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pt-2 pb-6 ${handover ? "justify-center" : ""}`}>
        <div className="flex flex-col gap-1">
          <h1 className="text-large-title font-bold tracking-tight">{title}</h1>
          {subtitle && <p className={handover ? "text-white/85" : "text-label-secondary"}>{subtitle}</p>}
        </div>
        {children}
      </div>

      {bleed}

      {actions && <footer className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pb-4">{actions}</footer>}
    </main>
  );
}
