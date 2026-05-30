"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import {
  findCurrentGuest,
  getLuckMessage,
  PartyGuest
} from "@/lib/party-storage";

export default function ConfirmationPage() {
  const [guest, setGuest] = useState<PartyGuest>();

  useEffect(() => {
    setGuest(findCurrentGuest());
  }, []);

  return (
    <ExperienceShell
      eyebrow="Registration Confirmed"
      title="You're In"
      subtitle="Your name is saved locally on this device and ready for the live event screens."
    >
      <div className="rounded-md border border-gold/40 bg-black/50 p-6 shadow-gold backdrop-blur">
        <p className="text-lg font-semibold text-champagne">
          {guest?.name ?? "Guest"}
        </p>
        <p className="mt-5 text-sm font-medium uppercase tracking-normal text-stone-300">
          Luck Score
        </p>
        <p className="mt-2 text-7xl font-black text-gold">
          {guest?.luckScore ?? "--"}
        </p>
        <p className="mt-4 text-base leading-7 text-stone-200">
          {guest
            ? getLuckMessage(guest.luckScore)
            : "Register from the join page to generate your score."}
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/join" className={primaryActionClassName}>
          Add Another Guest
        </Link>
        <Link href="/" className={secondaryActionClassName}>
          Back to Start
        </Link>
      </div>
    </ExperienceShell>
  );
}
