import { BorderBeam } from "@/components/ui/border-beam";

const CARD =
  "bg-background border-border text-foreground flex min-h-24 items-center justify-center rounded-2xl border px-5 text-center text-sm";

export default function BorderBeamColor() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <BorderBeam className="w-40 rounded-2xl" length={20}>
        <div className={CARD}>Primary</div>
      </BorderBeam>
      <BorderBeam
        className="w-40 rounded-2xl"
        color="var(--secondary-emphasis)"
        length={20}
      >
        <div className={CARD}>Secondary</div>
      </BorderBeam>
      <BorderBeam
        className="w-40 rounded-2xl"
        color="var(--success-emphasis)"
        length={20}
      >
        <div className={CARD}>Success</div>
      </BorderBeam>
      <BorderBeam className="w-40 rounded-2xl" color="#A78BFA" length={20}>
        <div className={CARD}>Custom</div>
      </BorderBeam>
    </div>
  );
}
export { BorderBeamColor };
