import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";

export default function LandingPage() {
  return (
    <ExperienceShell
      eyebrow="Premium Event System"
      title="Party Network"
      subtitle="A black and gold registration, live wall, raffle draw, and prize reveal experience for one unforgettable party."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/join" className={primaryActionClassName}>
          Join Event
        </Link>
        <Link href="/host" className={secondaryActionClassName}>
          Host Dashboard
        </Link>
      </div>
      <div className="mt-8 grid gap-3 text-left text-sm text-stone-300 sm:grid-cols-3">
        {["Register", "Draw", "Reveal"].map((item) => (
          <div
            key={item}
            className="rounded-md border border-gold/25 bg-black/40 p-4 backdrop-blur"
          >
            <p className="font-bold uppercase text-gold">{item}</p>
            <p className="mt-2 leading-6">
              {item === "Register"
                ? "Guests enter from one device and persist locally."
                : item === "Draw"
                  ? "Host chooses a winner from saved guests."
                  : "Prize reveals build up to the 8KG rice finale."}
            </p>
          </div>
        ))}
      </div>
    </ExperienceShell>
  );
}
