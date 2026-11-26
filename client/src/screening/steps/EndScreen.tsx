"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { ScreenFrame } from "../components/ScreenFrame";
import { customerMessage, OUTCOME_TITLE, REASON_TEXT } from "../outcomeText";
import { downloadJson, listScreenings, saveScreening } from "../records";
import { formatPower } from "../scoring";
import type { Outcome, ScreeningRecord } from "../types";
import { PendingCheck, SayToCustomer } from "./ResultStep";

/**
 * The end of a screening: outcome, reason, power, and one next action (S-74).
 * The screening is saved on the phone here (S-70), and saved screenings can be exported
 * as JSON until the server sync exists.
 */
/** Outcomes that send the customer elsewhere are shown in red; the rest in green. */
const REFERRAL = new Set<Outcome>(["REFER", "BLOCKED", "INCOMPLETE"]);

const OUTCOME_LABEL: Record<Outcome, string> = {
  BUY: "Fitted",
  REFER: "Refer",
  BLOCKED: "Blocked",
  NO_CORRECTION_NEEDED: "No glasses needed",
  INCOMPLETE: "Incomplete",
};

export function EndScreen({
  record,
  onRestart,
}: {
  record: ScreeningRecord;
  onRestart: () => void;
}) {
  const [saved, setSaved] = useState<ScreeningRecord[]>([]);

  // Saving twice (React StrictMode) is harmless: records are keyed by id.
  useEffect(() => {
    void saveScreening(record).then(listScreenings).then(setSaved);
  }, [record]);

  const result = record.provisional;
  if (!result) return null;
  const title = result.reason === "walk_away" ? "Walk-away recorded" : OUTCOME_TITLE[result.outcome];
  const power = record.chosenPower ?? record.recommendedPower;

  return (
    <ScreenFrame
      holder="distributor"
      title={title}
      actions={
        <Button onClick={onRestart}>
          Start a new screening
        </Button>
      }
    >
      <PendingCheck />
      <Group footer={REASON_TEXT[result.reason]}>
        <Row>
          <span>Customer</span>
          <span className="ml-auto text-label-secondary">{record.customer.name}</span>
        </Row>
        <Row>
          <span>Outcome</span>
          <span className={`ml-auto font-semibold ${REFERRAL.has(result.outcome) ? "text-refer" : "text-clear"}`}>
            {OUTCOME_LABEL[result.outcome]}
          </span>
        </Row>
        {result.reason === "red_flag" && (
          // S-26: the referral names the question that triggered it.
          <Row>
            <span className="shrink-0">Answered yes to</span>
            <span className="ml-auto text-right text-label-secondary">
              {record.redFlagAnswers.find((a) => a.answer)?.question}
            </span>
          </Row>
        )}
        {power !== null && (
          <Row>
            <span>{record.chosenPower !== null ? "Power fitted" : "Power needed"}</span>
            <span className="ml-auto text-title2 font-bold text-accent">{formatPower(power)}</span>
          </Row>
        )}
      </Group>
      {result.reason !== "walk_away" && <SayToCustomer text={customerMessage(result.outcome)} />}

      <Group header="On this phone">
        <Row>
          <span>{saved.length} {saved.length === 1 ? "screening" : "screenings"} saved</span>
          <button
            type="button"
            className="ml-auto min-h-11 text-accent disabled:text-label-secondary"
            onClick={() => downloadJson(saved, `screenings-${new Date().toISOString().slice(0, 10)}.json`)}
            disabled={saved.length === 0}
          >
            Export JSON
          </button>
        </Row>
      </Group>
    </ScreenFrame>
  );
}
