/**
 * Provisional scoring on the phone (S-72). The server recomputes all of this from the
 * raw records and its result wins (S-105); these helpers only let the distributor
 * continue without a network.
 */
import type { Direction } from "./optotype";

/** Whole years between a date of birth and today (S-20: we store the date, not the age). */
export function ageOn(dateOfBirth: string, today = new Date()): number {
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const birthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

/** Count answers that match the direction shown. Unseen (null) counts as wrong (S-47). */
export function countCorrect(answers: { shown: Direction; answered: Direction | null }[]): number {
  return answers.filter((a) => a.answered === a.shown).length;
}

/** Lens powers are always shown with a sign and two decimals, e.g. +1.50. */
export function formatPower(power: number): string {
  return `+${power.toFixed(2)}`;
}
