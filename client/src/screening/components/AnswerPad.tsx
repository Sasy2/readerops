import type { Direction } from "../optotype";

/** One chevron, rotated to point in each direction. */
const ROTATE: Record<Direction, string> = { right: "", down: "rotate-90", left: "rotate-180", up: "-rotate-90" };

/**
 * What sits below the test area. Answers are given by swiping on the test area only
 * (S-46); there are no arrow buttons. This keeps the "I can't see it" button (S-33, S-47)
 * and, in practice, a hint showing which way to swipe (S-42).
 */
export function AnswerPad({
  onAnswer,
  unseenLabel,
  hint,
  disabled,
}: {
  onAnswer: (answer: Direction | null) => void;
  unseenLabel: string;
  /** Practice only: the direction to show in the swipe hint. */
  hint?: Direction;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {hint && (
        <p className="flex items-center gap-3 text-headline font-semibold text-accent" aria-live="polite">
          <svg viewBox="0 0 24 24" className={`swipe-hint size-8 ${ROTATE[hint]}`} aria-hidden>
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Swipe {hint} on the white area
        </p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer(null)}
        className="min-h-[50px] rounded-full bg-accent-tint px-6 text-headline font-semibold text-accent disabled:opacity-40"
      >
        {unseenLabel}
      </button>
    </div>
  );
}
