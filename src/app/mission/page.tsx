"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { fetchGuestById } from "@/lib/supabase-guests";
import {
  completeGuestMission,
  fetchLatestGuestMission
} from "@/lib/supabase-missions";
import type { GuestMission } from "@/lib/supabase-missions";
import { useEventSettings } from "@/lib/use-event-settings";

export default function MissionPage() {
  const { settings } = useEventSettings();
  const [guestName, setGuestName] = useState("Guest");
  const [guestMission, setGuestMission] = useState<GuestMission>();
  const [message, setMessage] = useState("Loading your mission...");
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    async function loadMission() {
      const guestId = new URLSearchParams(window.location.search).get("id");

      if (!guestId) {
        setMessage("Register first so the host can assign you a mission.");
        return;
      }

      try {
        const [guest, mission] = await Promise.all([
          fetchGuestById(guestId),
          fetchLatestGuestMission(guestId)
        ]);

        setGuestName(guest?.name ?? "Guest");
        setGuestMission(mission);
        setMessage(
          mission
            ? "Your mission is live. Complete it in the room, then tap done."
            : "No mission assigned yet. Check back after the host launches a round."
        );
      } catch {
        setMessage("Could not load your mission. Please check with the host.");
      }
    }

    loadMission();
  }, []);

  async function handleCompleteMission() {
    if (!guestMission || guestMission.completedAt) {
      return;
    }

    setIsCompleting(true);
    setMessage("");

    try {
      await completeGuestMission(guestMission);
      setGuestMission({
        ...guestMission,
        completedAt: new Date().toISOString()
      });
      setMessage("Mission complete. Nicely done.");
    } catch {
      setMessage("Could not mark this mission complete. Try again in a moment.");
    } finally {
      setIsCompleting(false);
    }
  }

  const isComplete = Boolean(guestMission?.completedAt);

  return (
    <ExperienceShell
      eyebrow="Guest Mission"
      title={settings.title}
      subtitle={settings.subtitle}
    >
      <div className="rounded-md border border-gold/40 bg-black/50 p-6 text-left shadow-gold backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-normal text-gold">
          {guestName}
        </p>
        <h2 className="mt-3 text-2xl font-black leading-tight text-champagne">
          {guestMission?.mission.prompt ?? "Mission pending"}
        </h2>
        <p className="mt-4 text-base leading-7 text-stone-200">{message}</p>
        {guestMission ? (
          <button
            type="button"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-gold bg-gold px-6 py-3 text-center text-base font-bold text-obsidian shadow-gold transition hover:bg-champagne focus:outline-none focus:ring-2 focus:ring-champagne focus:ring-offset-2 focus:ring-offset-obsidian disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleCompleteMission}
            disabled={isCompleting || isComplete}
          >
            {isComplete
              ? "Mission Complete"
              : isCompleting
                ? "Saving..."
                : "Mark Complete"}
          </button>
        ) : null}
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
