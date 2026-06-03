"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { getLuckMessage } from "@/lib/party-storage";
import type { PartyGuest } from "@/lib/party-storage";
import { fetchGuestById } from "@/lib/supabase-guests";
import { useEventSettings } from "@/lib/use-event-settings";

export default function ConfirmationPage() {
  const { settings } = useEventSettings();
  const [guest, setGuest] = useState<PartyGuest>();
  const [message, setMessage] = useState("Loading your registration...");

  useEffect(() => {
    async function loadGuest() {
      const guestId = new URLSearchParams(window.location.search).get("id");

      if (!guestId) {
        setMessage("Register from the join page to generate your score.");
        return;
      }

      try {
        const nextGuest = await fetchGuestById(guestId);
        setGuest(nextGuest);
        setMessage(
          nextGuest
            ? getLuckMessage(nextGuest.luckScore)
            : "Register from the join page to generate your score."
        );
      } catch {
        setMessage("Could not load your registration. Please check with the host.");
      }
    }

    loadGuest();
  }, []);

  return (
    <ExperienceShell
      eyebrow="Registration Confirmed"
      title={settings.title}
      subtitle={settings.subtitle}
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
          {message}
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href={guest ? `/mission?id=${encodeURIComponent(guest.id)}` : "/mission"}
          className={primaryActionClassName}
        >
          View Mission
        </Link>
        <Link href="/join" className={secondaryActionClassName}>
          Add Another Guest
        </Link>
        <Link href="/" className={secondaryActionClassName}>
          Back to Start
        </Link>
      </div>
    </ExperienceShell>
  );
}
