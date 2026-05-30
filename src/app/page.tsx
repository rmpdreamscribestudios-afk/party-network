"use client";

import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { useEventSettings } from "@/lib/use-event-settings";

export default function LandingPage() {
  const { settings } = useEventSettings();

  return (
    <ExperienceShell
      eyebrow="Premium Event System"
      title={settings.title}
      subtitle={settings.subtitle}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/join" className={primaryActionClassName}>
          Join Event
        </Link>
        <Link href="/host-login" className={secondaryActionClassName}>
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
                ? "Guests join from any phone and sync to the shared list."
                : item === "Draw"
                  ? "Host chooses a winner from Supabase guests."
                  : "Prize reveals build up to the 8KG rice finale."}
            </p>
          </div>
        ))}
      </div>
    </ExperienceShell>
  );
}
