"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

/**
 * The app's only way to show a message that needs attention. Never use the browser's
 * alert(), confirm() or prompt(): they block the page and look foreign (AGENTS.md).
 *
 * It drops in at the top of the screen, because the action buttons live at the bottom.
 * Closes with its button, the Escape key, or a tap on the dimmed background.
 */
export function TopModal({
  title,
  message,
  actionLabel = "OK",
  onClose,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const messageId = useId();
  const action = useRef<HTMLButtonElement>(null);

  // Move focus into the modal, and let Escape close it.
  useEffect(() => {
    action.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-black/30 px-3 pt-[calc(env(safe-area-inset-top)+12px)]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(e) => e.stopPropagation()}
        className="top-modal flex w-full max-w-lg flex-col gap-3 rounded-[20px] bg-card p-5 text-label shadow-[0_10px_40px_rgb(0_0_0/0.25)]"
      >
        <h2 id={titleId} className="text-headline font-semibold">
          {title}
        </h2>
        <p id={messageId} className="text-subhead text-label-secondary">
          {message}
        </p>
        <Button ref={action} onClick={onClose}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
