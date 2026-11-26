import type { ButtonHTMLAttributes, Ref } from "react";

/**
 * iOS-style capsule buttons (HIG buttons.md).
 * primary – filled system blue: the one most likely action per screen
 * tinted  – blue text on a light blue fill: the other actions
 * inverse – white fill on the blue handover screens, where a blue button would disappear
 */
type Variant = "primary" | "tinted" | "inverse";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white active:bg-accent-pressed disabled:bg-fill disabled:text-label-secondary",
  tinted: "bg-accent-tint text-accent active:bg-fill disabled:bg-fill disabled:text-label-secondary",
  inverse: "bg-white text-accent active:bg-accent-tint",
};

/** Full-width, at least 50px tall (above the 44pt minimum hit region). */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      className={`min-h-[50px] w-full rounded-full px-5 text-headline font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
