/**
 * Words for outcomes. S-75: the customer only ever hears "may benefit from reading
 * glasses" or "please visit an eye care professional", never a diagnosis.
 */
import type { Outcome, OutcomeReason } from "./types";

export const CUSTOMER_MESSAGE = {
  benefit: "You may benefit from reading glasses.",
  visit: "Please visit an eye care professional.",
  none: "You don't need reading glasses right now.",
} as const;

export const OUTCOME_TITLE: Record<Outcome, string> = {
  BUY: "Reading glasses fitted",
  REFER: "Refer to an eye care professional",
  BLOCKED: "This customer can't be screened",
  NO_CORRECTION_NEEDED: "No reading glasses needed",
  INCOMPLETE: "The screening couldn't finish",
};

/** Plain-language reasons for the distributor. */
export const REASON_TEXT: Record<OutcomeReason, string> = {
  under_18: "Customers under 18 can't be screened.",
  below_min_age: "The customer is younger than the minimum age for reading glasses.",
  red_flag: "The customer answered yes to a health question.",
  distance_va: "The customer couldn't pass the distance check.",
  no_level_passed: "The customer couldn't read the largest near symbols.",
  incomplete_render: "This phone couldn't draw the next symbol size clearly.",
  outside_age_table: "There's no starting power for the customer's age.",
  no_fit: "No trial power gave clear reading at the string length.",
  walk_away: "The power the customer needs isn't in your stock.",
  fit_confirmed: "A trial pair gave clear reading at the string length.",
  not_impaired: "The customer read the small symbols well.",
};

export function customerMessage(outcome: Outcome): string {
  if (outcome === "BUY") return CUSTOMER_MESSAGE.benefit;
  if (outcome === "NO_CORRECTION_NEEDED") return CUSTOMER_MESSAGE.none;
  return CUSTOMER_MESSAGE.visit;
}
