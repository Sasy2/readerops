"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TopModal } from "@/components/ui/TopModal";
import { ScreenFrame } from "../components/ScreenFrame";
import { startScreening, type StepProps } from "../flow";
import type { Sex } from "../types";

const INPUT = "min-h-11 flex-1 bg-transparent text-right text-label outline-none placeholder:text-label-secondary";

/** Who is being screened. S-20: we record the date of birth, not only the age. */
export function CustomerStep({ record, update, next, step, totalSteps }: StepProps) {
  const [name, setName] = useState(record.customer.name);
  const [dateOfBirth, setDateOfBirth] = useState(record.customer.dateOfBirth);
  const [sex, setSex] = useState<Sex>(record.customer.sex);
  const [error, setError] = useState<string | null>(null);
  const ready = name.trim().length > 0 && dateOfBirth !== "";

  const start = () => {
    // Checked on tap, not during render: Next.js prerenders this page, so no clock reads there.
    if (dateOfBirth > new Date().toISOString().slice(0, 10)) {
      setError("The date of birth is in the future. Check the year.");
      return;
    }
    update({ ...startScreening(), customer: { name: name.trim(), dateOfBirth, sex } });
    next();
  };

  return (
    <ScreenFrame
      holder="distributor"
      step={step}
      totalSteps={totalSteps}
      title="New screening"
      subtitle="Saved on this phone only."
      actions={
        <Button disabled={!ready} onClick={start}>
          Continue
        </Button>
      }
    >
      <Group header="Customer">
        <Row>
          <label htmlFor="name" className="shrink-0">
            Name
          </label>
          <input id="name" className={INPUT} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </Row>
        <Row>
          <label htmlFor="dob" className="shrink-0">
            Date of birth
          </label>
          <input
            id="dob"
            className={INPUT}
            type="date"
            value={dateOfBirth}
            aria-invalid={error !== null}
            onChange={(e) => {
              setDateOfBirth(e.target.value);
              setError(null);
            }}
          />
        </Row>
        <Row>
          <span className="shrink-0">Sex</span>
          <div className="ml-auto w-44">
            <SegmentedControl
              label="Sex"
              value={sex}
              onChange={setSex}
              options={[
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
              ]}
            />
          </div>
        </Row>
      </Group>
      {error && <TopModal title="Check the date of birth" message={error} onClose={() => setError(null)} />}
    </ScreenFrame>
  );
}
