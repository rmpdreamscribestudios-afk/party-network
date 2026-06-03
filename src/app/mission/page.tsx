"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
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
  const [notes, setNotes] = useState("");
  const [photoProofUrl, setPhotoProofUrl] = useState("");

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
        setNotes(mission?.notes ?? "");
        setPhotoProofUrl(mission?.photoProofUrl ?? "");
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
      await completeGuestMission(guestMission, {
        notes,
        photoProofUrl
      });
      setGuestMission({
        ...guestMission,
        completedAt: new Date().toISOString(),
        notes,
        photoProofUrl
      });
      setMessage("Mission complete. Nicely done.");
    } catch {
      setMessage("Could not mark this mission complete. Try again in a moment.");
    } finally {
      setIsCompleting(false);
    }
  }

  const isComplete = Boolean(guestMission?.completedAt);

  function handlePhotoProof(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoProofUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

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
        {guestMission ? (
          <p className="mt-3 inline-flex rounded-md border border-gold/30 px-3 py-1 text-sm font-bold text-gold">
            {guestMission.mission.category}
          </p>
        ) : null}
        <p className="mt-4 text-base leading-7 text-stone-200">{message}</p>
        {guestMission ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-stone-200">
                Optional notes
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Who did you meet? What happened?"
                disabled={isComplete}
                className="mt-2 w-full rounded-md border border-stone-700 bg-charcoal px-4 py-3 text-base text-champagne outline-none transition placeholder:text-stone-500 focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-70"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-200">
                  Photo proof link
                </span>
                <input
                  value={photoProofUrl.startsWith("data:") ? "" : photoProofUrl}
                  onChange={(event) => setPhotoProofUrl(event.target.value)}
                  placeholder="Optional URL"
                  disabled={isComplete}
                  className="mt-2 min-h-12 w-full rounded-md border border-stone-700 bg-charcoal px-4 text-base text-champagne outline-none transition placeholder:text-stone-500 focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-70"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-200">
                  Or choose photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoProof}
                  disabled={isComplete}
                  className="mt-2 min-h-12 w-full rounded-md border border-stone-700 bg-charcoal px-3 py-3 text-sm text-champagne file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-2 file:font-bold file:text-obsidian disabled:opacity-70"
                />
              </label>
            </div>

            {photoProofUrl ? (
              <p className="rounded-md border border-gold/20 bg-stone-950/70 p-3 text-sm font-semibold text-stone-200">
                Photo proof ready.
              </p>
            ) : null}

            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-gold bg-gold px-6 py-3 text-center text-base font-bold text-obsidian shadow-gold transition hover:bg-champagne focus:outline-none focus:ring-2 focus:ring-champagne focus:ring-offset-2 focus:ring-offset-obsidian disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCompleteMission}
              disabled={isCompleting || isComplete}
            >
              {isComplete
                ? "Mission Complete"
                : isCompleting
                  ? "Saving..."
                  : "Mark Mission Completed"}
            </button>
          </div>
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
