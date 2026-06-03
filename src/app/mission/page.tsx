"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import {
  fetchGuestById,
  fetchGuests
} from "@/lib/supabase-guests";
import type { PartyGuest } from "@/lib/party-storage";
import {
  connectionMissions,
  createConnectionRecord,
  fetchConnectionRecords,
  getConnectionStats,
  getMatchSuggestion
} from "@/lib/connection-engine";
import type {
  ConnectionMission,
  ConnectionRecord,
  MatchSuggestion
} from "@/lib/connection-engine";
import {
  completeGuestMission,
  fetchLatestGuestMission
} from "@/lib/supabase-missions";
import type { GuestMission } from "@/lib/supabase-missions";
import { useEventSettings } from "@/lib/use-event-settings";
import { getEventTemplateConnectionMissions } from "@/lib/event-templates";

export default function MissionPage() {
  const { settings } = useEventSettings();
  const [guestName, setGuestName] = useState("Guest");
  const [guest, setGuest] = useState<PartyGuest>();
  const [guests, setGuests] = useState<PartyGuest[]>([]);
  const [connectionRecords, setConnectionRecords] = useState<ConnectionRecord[]>(
    []
  );
  const [guestMission, setGuestMission] = useState<GuestMission>();
  const [matchSuggestion, setMatchSuggestion] = useState<MatchSuggestion>();
  const [selectedMissionId, setSelectedMissionId] = useState(
    connectionMissions[0].id
  );
  const [metGuestId, setMetGuestId] = useState("");
  const [personFirstName, setPersonFirstName] = useState("");
  const [reflection, setReflection] = useState("");
  const [connectionMessage, setConnectionMessage] = useState("");
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
        const [guest, nextGuests, nextConnectionRecords] = await Promise.all([
          fetchGuestById(guestId),
          fetchGuests(),
          fetchConnectionRecords()
        ]);
        let mission: GuestMission | undefined;

        try {
          mission = await fetchLatestGuestMission(guestId);
        } catch {
          mission = undefined;
        }

        setGuestName(guest?.name ?? "Guest");
        setGuest(guest);
        setGuests(nextGuests);
        setConnectionRecords(nextConnectionRecords);
        const suggestion = guest
          ? getMatchSuggestion(guest, nextGuests)
          : undefined;
        setMatchSuggestion(suggestion);
        setMetGuestId(suggestion?.guest.id ?? "");
        setGuestMission(mission);
        setNotes(mission?.notes ?? "");
        setPhotoProofUrl(mission?.photoProofUrl ?? "");
        setMessage(
          mission
            ? "Your mission is live. Complete it in the room, then tap done."
            : "No timed mission assigned yet. Try a connection mission below."
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
  const connectionStats = guest
    ? getConnectionStats(
        guests,
        connectionRecords.filter((record) => record.guestId === guest.id)
      )
    : undefined;
  const otherGuests = guests.filter((nextGuest) => nextGuest.id !== guest?.id);
  const availableConnectionMissions = getUniqueConnectionMissions([
    ...getEventTemplateConnectionMissions(settings.eventType),
    ...connectionMissions
  ]);
  const selectedConnectionMission =
    availableConnectionMissions.find(
      (mission) => mission.id === selectedMissionId
    ) ?? availableConnectionMissions[0];

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

  async function handleConnectionComplete() {
    if (!guest) {
      return;
    }

    await createConnectionRecord({
      guestId: guest.id,
      metGuestId: metGuestId || undefined,
      personFirstName,
      missionId: selectedConnectionMission.id,
      reflection
    });
    setConnectionRecords(await fetchConnectionRecords());
    setPersonFirstName("");
    setReflection("");
    setConnectionMessage("Connection logged. Keep the conversation moving.");
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
      {guest ? (
        <div className="mt-6 rounded-md border border-gold/40 bg-black/50 p-6 text-left shadow-gold backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-normal text-gold">
            Connection Engine
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-champagne">
            Find a real conversation
          </h2>
          {matchSuggestion ? (
            <p className="mt-3 rounded-md border border-gold/25 bg-stone-950/70 p-3 text-base font-semibold text-stone-100">
              {matchSuggestion.message}
            </p>
          ) : (
            <p className="mt-3 text-base leading-7 text-stone-200">
              You may be the first profile with connection details. Pick a mission
              and invite someone nearby.
            </p>
          )}

          <div className="mt-5 space-y-4">
            <div className="rounded-md border border-gold/25 bg-stone-950/70 p-4">
              <p className="text-xs font-bold uppercase text-gold">
                {selectedConnectionMission.category}
              </p>
              <p className="mt-2 text-xl font-black leading-tight text-champagne">
                {selectedConnectionMission.prompt}
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-stone-200">
                Guided mission
              </span>
              <select
                value={selectedMissionId}
                onChange={(event) => setSelectedMissionId(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-md border border-stone-700 bg-charcoal px-4 text-base text-champagne outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              >
                {getMissionGroups(availableConnectionMissions).map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.missions.map((mission) => (
                      <option key={mission.id} value={mission.id}>
                        {mission.prompt}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-200">
                  Person's first name
                </span>
                <input
                  value={personFirstName}
                  onChange={(event) => setPersonFirstName(event.target.value)}
                  placeholder="Optional"
                  className="mt-2 min-h-12 w-full rounded-md border border-stone-700 bg-charcoal px-4 text-base text-champagne outline-none transition placeholder:text-stone-500 focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-200">
                  Registered guest
                </span>
                <select
                  value={metGuestId}
                  onChange={(event) => setMetGuestId(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-md border border-stone-700 bg-charcoal px-4 text-base text-champagne outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                >
                  <option value="">Someone new</option>
                  {otherGuests.map((nextGuest) => (
                    <option key={nextGuest.id} value={nextGuest.id}>
                      {nextGuest.firstName || nextGuest.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-stone-200">
                Short reflection
              </span>
              <textarea
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                rows={3}
                placeholder="Optional"
                className="mt-2 w-full rounded-md border border-stone-700 bg-charcoal px-4 py-3 text-base text-champagne outline-none transition placeholder:text-stone-500 focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
            </label>

            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-gold bg-gold px-6 py-3 text-center text-base font-bold text-obsidian shadow-gold transition hover:bg-champagne focus:outline-none focus:ring-2 focus:ring-champagne focus:ring-offset-2 focus:ring-offset-obsidian"
              onClick={handleConnectionComplete}
            >
              I Made This Connection
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ConnectionStat
              label="Connections"
              value={(connectionStats?.connectionsCreated ?? 0).toString()}
            />
            <ConnectionStat
              label="Missions Done"
              value={(connectionStats?.missionsCompleted ?? 0).toString()}
            />
            <ConnectionStat
              label="New People"
              value={(connectionStats?.newPeopleMet ?? 0).toString()}
            />
          </div>

          {connectionMessage ? (
            <p className="mt-4 rounded-md border border-gold/30 bg-black/50 p-3 text-sm font-semibold text-champagne">
              {connectionMessage}
            </p>
          ) : null}
        </div>
      ) : null}
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

function getUniqueConnectionMissions(missions: ConnectionMission[]) {
  return missions.filter(
    (mission, index) =>
      missions.findIndex((nextMission) => nextMission.id === mission.id) === index
  );
}

function getMissionGroups(missions: ConnectionMission[]) {
  return missions.reduce<Array<{
    category: ConnectionMission["category"];
    missions: ConnectionMission[];
  }>>((groups, mission) => {
    const group = groups.find(
      (nextGroup) => nextGroup.category === mission.category
    );

    if (group) {
      group.missions.push(mission);
    } else {
      groups.push({ category: mission.category, missions: [mission] });
    }

    return groups;
  }, []);
}

function ConnectionStat({
  label,
  value
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border border-stone-800 bg-stone-950/70 p-3">
      <p className="text-xs uppercase text-stone-400">{label}</p>
      <p className="mt-1 text-3xl font-black text-gold">{value}</p>
    </div>
  );
}
