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
      eyebrow="Shared Experiences Platform"
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
      <div className="mt-8 grid gap-3 text-left text-sm text-slate-200 sm:grid-cols-3">
        {["Connect", "Participate", "Remember"].map((item) => (
          <div
            key={item}
            className="pn-card p-4"
          >
            <p className="font-bold uppercase text-party-teal">{item}</p>
            <p className="mt-2 leading-6">
              {item === "Connect"
                ? "Guests join from any phone and become part of the shared room."
                : item === "Participate"
                  ? "Hosts guide live moments that keep everyone involved."
                  : "Reveals and missions turn the event into a memory people can share."}
            </p>
          </div>
        ))}
      </div>
    </ExperienceShell>
  );
}
