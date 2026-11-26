/** iOS switch (HIG toggles.md), tinted with the app's blue. The whole row is the tap target. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 px-4 py-2.5">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-fill transition-colors peer-checked:bg-accent peer-focus-visible:outline-3 peer-focus-visible:outline-accent after:absolute after:top-[2px] after:left-[2px] after:size-[27px] after:rounded-full after:bg-white after:shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}
