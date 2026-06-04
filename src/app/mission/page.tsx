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
  assignConnectionMissionToGuest,
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
          if (!mission && guest) {
            mission = await assignConnectionMissionToGuest(guestId);
          }
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
      <div className="pn-mission-card text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-party-teal">
              {guestName}
            </p>
            {guestMission ? (
              <p className="mt-3 inline-flex rounded-md border border-party-gold/40 bg-party-gold/10 px-3 py-1 text-xs font-black uppercase text-party-gold">
                {guestMission.mission.category}
              </p>
            ) : null}
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-party-teal/40 bg-party-navy/80">
            <span className="text-lg font-black text-party-teal">
              {isComplete ? "100%" : guestMission ? "50%" : "0%"}
            </span>
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-black leading-tight text-party-soft">
          {guestMission?.mission.prompt ?? "Mission pending"}
        </h2>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-party-blue/25">
          <div
            className="h-full rounded-full bg-party-teal transition-all duration-500"
            style={{ width: isComplete ? "100%" : guestMission ? "50%" : "0%" }}
          />
        </div>
        <p className="mt-4 text-base leading-7 text-slate-200">{message}</p>
        {isComplete ? (
          <div className="pn-mission-complete-burst mt-5" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {guestMission ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-party-soft">
                Optional notes
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Who did you meet? What happened?"
                disabled={isComplete}
                className="mt-2 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-4 py-3 text-base text-party-soft outline-none transition placeholder:text-slate-400 focus:border-party-teal focus:ring-2 focus:ring-party-teal/30 disabled:opacity-70"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-party-soft">
                  Photo proof link
                </span>
                <input
                  value={photoProofUrl.startsWith("data:") ? "" : photoProofUrl}
                  onChange={(event) => setPhotoProofUrl(event.target.value)}
                  placeholder="Optional URL"
                  disabled={isComplete}
                  className="mt-2 min-h-12 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-4 text-base text-party-soft outline-none transition placeholder:text-slate-400 focus:border-party-teal focus:ring-2 focus:ring-party-teal/30 disabled:opacity-70"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-party-soft">
                  Or choose photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoProof}
                  disabled={isComplete}
                  className="mt-2 min-h-12 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-3 py-3 text-sm text-party-soft file:mr-3 file:rounded-md file:border-0 file:bg-party-teal file:px-3 file:py-2 file:font-bold file:text-party-navy disabled:opacity-70"
                />
              </label>
            </div>

            {photoProofUrl ? (
              <p className="pn-success-state">
                Photo proof ready.
              </p>
            ) : null}

            <button
              type="button"
              className={`${primaryActionClassName} disabled:cursor-not-allowed disabled:opacity-60`}
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
        <div className="pn-guest-card mt-6 text-left">
          <p className="text-sm font-bold uppercase tracking-normal text-party-teal">
            Connection Engine
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-party-soft">
            Find a real conversation
          </h2>
          {matchSuggestion ? (
            <p className="mt-3 rounded-md border border-party-teal/35 bg-party-teal/10 p-3 text-base font-semibold text-slate-100">
              {matchSuggestion.message}
            </p>
          ) : (
            <p className="mt-3 text-base leading-7 text-slate-200">
              You may be the first profile with connection details. Pick a mission
              and invite someone nearby.
            </p>
          )}

          <div className="mt-5 space-y-4">
            <div className="rounded-md border border-party-blue/25 bg-party-navy/70 p-4">
              <p className="text-xs font-bold uppercase text-party-gold">
                {selectedConnectionMission.category}
              </p>
              <p className="mt-2 text-xl font-black leading-tight text-party-soft">
                {selectedConnectionMission.prompt}
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-party-soft">
                Guided mission
              </span>
              <select
                value={selectedMissionId}
                onChange={(event) => setSelectedMissionId(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-4 text-base text-party-soft outline-none transition focus:border-party-teal focus:ring-2 focus:ring-party-teal/30"
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
                <span className="text-sm font-semibold text-party-soft">
                  Person&apos;s first name
                </span>
                <input
                  value={personFirstName}
                  onChange={(event) => setPersonFirstName(event.target.value)}
                  placeholder="Optional"
                  className="mt-2 min-h-12 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-4 text-base text-party-soft outline-none transition placeholder:text-slate-400 focus:border-party-teal focus:ring-2 focus:ring-party-teal/30"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-party-soft">
                  Registered guest
                </span>
                <select
                  value={metGuestId}
                  onChange={(event) => setMetGuestId(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-4 text-base text-party-soft outline-none transition focus:border-party-teal focus:ring-2 focus:ring-party-teal/30"
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
              <span className="text-sm font-semibold text-party-soft">
                Short reflection
              </span>
              <textarea
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                rows={3}
                placeholder="Optional"
                className="mt-2 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-4 py-3 text-base text-party-soft outline-none transition placeholder:text-slate-400 focus:border-party-teal focus:ring-2 focus:ring-party-teal/30"
              />
            </label>

            <button
              type="button"
              className={primaryActionClassName}
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
            <p className="pn-success-state mt-4">
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
    <div className="pn-stat-card p-3">
      <p className="text-xs font-bold uppercase text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-black text-party-teal">{value}</p>
    </div>
  );
}
