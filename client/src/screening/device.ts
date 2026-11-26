/**
 * Browser device features the screening needs (S-10 to S-15, S-48).
 * Every call is best-effort: a missing feature must never crash the screening.
 */

/** S-10: fullscreen. Must be called from a tap (browsers require a user gesture). */
export async function enterFullscreen(): Promise<boolean> {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    return true;
  } catch {
    return false;
  }
}

export async function exitFullscreen(): Promise<void> {
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
}

/** S-11: keep the screen awake. Returns a release function. */
export async function keepScreenAwake(): Promise<() => void> {
  try {
    const lock = await navigator.wakeLock.request("screen");
    return () => void lock.release();
  } catch {
    return () => undefined;
  }
}

/** S-12 (Should): lock portrait. Only works in fullscreen on Android; ignored elsewhere. */
export async function lockPortrait(): Promise<void> {
  const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
  await orientation.lock?.("portrait").catch(() => undefined);
}

/**
 * S-48: the same short vibration for every answer, so it never hints at correctness.
 * Android uses the Vibration API. iPhone Safari has no Vibration API, so there we use the
 * one haptic Safari offers: toggling a switch-style checkbox plays the system tap
 * (iOS 18 and later; older iPhones stay silent). It must run inside the swipe or tap
 * handler, because Safari only allows it during a user gesture.
 */
export function answerVibration(): void {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(30);
    return;
  }
  iosHaptic();
}

function iosHaptic(): void {
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.display = "none";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", ""); // Safari's native switch: toggling it plays the haptic
  label.append(input);
  document.body.append(label);
  label.click();
  label.remove();
}
