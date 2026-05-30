"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { secondaryActionClassName } from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { findCurrentGuest, getLuckMessage, PartyGuest } from "@/lib/party-storage";

export default function SuccessPage() {
  const [guest, setGuest] = useState<PartyGuest>();

  useEffect(() => {
    setGuest(findCurrentGuest());
  }, []);

  return (
    <ExperienceShell eyebrow="Access Granted" title="Access Granted">
      <div className="rounded-md border border-gold/40 bg-black/45 p-6 shadow-gold backdrop-blur">
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
          {guest ? getLuckMessage(guest.luckScore) : "The Network is waiting for you."}
        </p>
      </div>
      <Link href="/" className={`mt-8 ${secondaryActionClassName}`}>
        Back to Entrance
      </Link>
    </ExperienceShell>
  );
}
