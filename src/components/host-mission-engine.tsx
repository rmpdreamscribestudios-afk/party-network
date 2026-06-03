"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import type { PartyGuest } from "@/lib/party-storage";
import { isSupabaseConfigured } from "@/lib/supabase-guests";
import {
  createMission,
  deleteMission,
  fetchActiveMissionRoundStats,
  fetchMissions,
  getMissionRoundTimeLeft,
  launchMissionRound,
  missionCategories,
  missionExamples,
  subscribeToMissionChanges,
  updateMission
} from "@/lib/supabase-missions";
import type {
  Mission,
  MissionCategory,
  MissionInput as SupabaseMissionInput,
  MissionRoundStats
} from "@/lib/supabase-missions";
import {
  getEventTemplate,
  getEventTemplateMissions,
  type EventType
} from "@/lib/event-templates";

type MissionInput = SupabaseMissionInput;

type MissionSeed = Readonly<
  Pick<MissionInput, "prompt" | "category"> &
    Partial<Pick<MissionInput, "isTemplate">>
>;

type HostMissionEngineProps = Readonly<{
  guests: PartyGuest[];
  eventType: EventType;
}>;

const timerOptions = [5, 10, 15];

const emptyStats: MissionRoundStats = {
  totalGuests: 0,
  assigned: 0,
  completed: 0,
  completionPercentage: 0
};

export function HostMissionEngine({ guests, eventType }: HostMissionEngineProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<MissionCategory>("Icebreaker");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string>();
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [stats, setStats] = useState<MissionRoundStats>(emptyStats);
  const [timeLeft, setTimeLeft] = useState("--:--");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingMission, setIsSavingMission] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const eventTemplate = getEventTemplate(eventType);
  const templateMissions = getEventTemplateMissions(eventType);

  const activeMissions = useMemo(
    () => missions.filter((mission) => mission.isActive),
    [missions]
  );

  const templates = useMemo(
    () => missions.filter((mission) => mission.isTemplate),
    [missions]
  );

  const loadMissionEngine = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus("Supabase is required for mission rounds.");
      return;
    }

    setIsLoading(true);

    try {
      const [nextMissions, nextStats] = await Promise.all([
        fetchMissions(),
        fetchActiveMissionRoundStats()
      ]);

      setMissions(nextMissions);
      setStats(nextStats);
      setTimeLeft(getMissionRoundTimeLeft(nextStats.round));
    } catch {
      setStatus("Could not load missions. Check the Supabase mission tables.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissionEngine();
    const channel = subscribeToMissionChanges(loadMissionEngine);

    return () => {
      channel?.unsubscribe();
    };
  }, [loadMissionEngine]);

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setTimeLeft(getMissionRoundTimeLeft(stats.round));
    }, 1000);

    return () => {
      window.clearInterval(tickId);
    };
  }, [stats.round]);

  async function handleSaveMission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPrompt = prompt.trim();

    if (!nextPrompt) {
      return;
    }

    setStatus("");
    setIsSavingMission(true);

    try {
      if (editingMissionId) {
        await updateMission(editingMissionId, {
          prompt: nextPrompt,
          category,
          isTemplate: saveAsTemplate,
          isActive: true
        });
        setStatus("Mission updated.");
      } else {
        await createMission({
          prompt: nextPrompt,
          category,
          isTemplate: saveAsTemplate
        });
        setStatus(saveAsTemplate ? "Mission template saved." : "Mission created.");
      }

      resetMissionForm();
      await loadMissionEngine();
    } catch {
      setStatus("Could not save mission.");
    } finally {
      setIsSavingMission(false);
    }
  }

  async function handleDeleteMission(missionId: string) {
    setStatus("");

    try {
      await deleteMission(missionId);
      setStatus("Mission deleted.");
      if (editingMissionId === missionId) {
        resetMissionForm();
      }
      await loadMissionEngine();
    } catch {
      setStatus("Could not delete mission. It may already be assigned to a round.");
    }
  }

  async function handleLaunchRound() {
    setStatus("");
    setIsLaunching(true);

    try {
      await launchMissionRound(guests, missions, durationMinutes);
      setStatus(
        `Mission round launched for ${guests.length} guests. Timer: ${durationMinutes} minutes.`
      );
      await loadMissionEngine();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not launch round.");
    } finally {
      setIsLaunching(false);
    }
  }

  function editMission(mission: Mission) {
    setEditingMissionId(mission.id);
    setPrompt(mission.prompt);
    setCategory(mission.category);
    setSaveAsTemplate(mission.isTemplate);
  }

  function applyTemplate(mission: Mission) {
    setEditingMissionId(undefined);
    setPrompt(mission.prompt);
    setCategory(mission.category);
    setSaveAsTemplate(false);
  }

  function applyExample(example: MissionSeed) {
    setEditingMissionId(undefined);
    setPrompt(example.prompt);
    setCategory(example.category);
    setSaveAsTemplate(Boolean(example.isTemplate));
  }

  async function handleUseDefaultTemplate() {
    setStatus("");
    setIsLoadingTemplate(true);

    try {
      const existingPrompts = new Set(
        missions.map((mission) => mission.prompt.trim().toLowerCase())
      );
      const missingMissions = templateMissions.filter(
        (mission) => !existingPrompts.has(mission.prompt.trim().toLowerCase())
      );

      await Promise.all(missingMissions.map((mission) => createMission(mission)));
      setStatus(
        missingMissions.length
          ? `${eventType} template loaded with ${missingMissions.length} new items.`
          : `${eventType} template is already loaded.`
      );
      await loadMissionEngine();
    } catch {
      setStatus("Could not load the default template.");
    } finally {
      setIsLoadingTemplate(false);
    }
  }

  function resetMissionForm() {
    setEditingMissionId(undefined);
    setPrompt("");
    setCategory("Icebreaker");
    setSaveAsTemplate(false);
  }

  return (
    <section className="rounded-md border border-gold/30 bg-black/45 p-5 md:col-span-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase text-stone-400">Mission Engine v2</p>
          <h2 className="mt-1 text-2xl font-bold text-champagne">
            Live Participation Rounds
          </h2>
          <p className="mt-2 text-sm font-semibold text-gold">
            {eventType} template
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[auto_auto] sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-stone-300">Round timer</p>
            <div className="grid grid-cols-3 gap-2">
              {timerOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`min-h-11 rounded-md border px-3 text-sm font-bold transition ${
                    durationMinutes === minutes
                      ? "border-gold bg-gold text-obsidian"
                      : "border-stone-700 text-champagne hover:border-gold"
                  }`}
                  onClick={() => setDurationMinutes(minutes)}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={primaryActionClassName}
            onClick={handleLaunchRound}
            disabled={isLaunching || !guests.length || !activeMissions.length}
          >
            {isLaunching ? "Launching..." : "Start Mission Round"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <StatTile label="Total guests" value={guests.length.toString()} />
        <StatTile label="Missions assigned" value={stats.assigned.toString()} />
        <StatTile label="Missions completed" value={stats.completed.toString()} />
        <StatTile
          label="Completion"
          value={`${stats.completionPercentage}%`}
          detail={stats.round ? `Time left ${timeLeft}` : "No active round"}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,1.1fr)]">
        <form onSubmit={handleSaveMission} className="space-y-4">
          <div className="rounded-md border border-gold/25 bg-stone-950/70 p-3">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase text-stone-400">
                  Default Template
                </p>
                <p className="mt-1 text-sm font-semibold text-champagne">
                  {templateMissions.length} reusable prompts for this event type.
                </p>
              </div>
              <button
                type="button"
                className={secondaryActionClassName}
                onClick={handleUseDefaultTemplate}
                disabled={isLoadingTemplate}
              >
                {isLoadingTemplate ? "Loading..." : "Use Default Template"}
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <TemplateList
                title="Suggested Missions"
                items={eventTemplate.suggestedMissions}
                onApply={applyExample}
              />
              <TemplateList
                title="Icebreakers"
                items={eventTemplate.icebreakers}
                onApply={applyExample}
              />
              <TemplateList
                title="Participation"
                items={eventTemplate.participationActivities}
                onApply={applyExample}
              />
              <TemplateList
                title="Host Prompts"
                items={eventTemplate.hostPrompts}
                onApply={applyExample}
              />
              <TemplateList
                title="Connection Missions"
                items={eventTemplate.connectionMissions}
                onApply={applyExample}
              />
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-stone-200">Mission</span>
            <textarea
              required
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Give someone a kind compliment."
              rows={4}
              className="mt-2 w-full rounded-md border border-stone-700 bg-charcoal px-4 py-3 text-base text-champagne outline-none transition placeholder:text-stone-500 focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-stone-200">Category</span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as MissionCategory)
                }
                className="mt-2 min-h-12 w-full rounded-md border border-stone-700 bg-charcoal px-4 text-base text-champagne outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              >
                {missionCategories.map((nextCategory) => (
                  <option key={nextCategory} value={nextCategory}>
                    {nextCategory}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-md border border-stone-700 px-4 text-sm font-bold text-champagne">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(event) => setSaveAsTemplate(event.target.checked)}
                className="h-5 w-5 accent-gold"
              />
              Save template
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              className={primaryActionClassName}
              disabled={isSavingMission}
            >
              {isSavingMission
                ? "Saving..."
                : editingMissionId
                  ? "Update Mission"
                  : "Create Mission"}
            </button>
            <button
              type="button"
              className={secondaryActionClassName}
              onClick={editingMissionId ? resetMissionForm : loadMissionEngine}
              disabled={isLoading}
            >
              {editingMissionId ? "Cancel Edit" : isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {missionExamples.map((example) => (
              <button
                key={example.prompt}
                type="button"
                className="rounded-md border border-stone-700 px-3 py-2 text-left text-sm font-semibold text-stone-200 transition hover:border-gold"
                onClick={() => applyExample(example)}
              >
                {example.category}: {example.prompt}
              </button>
            ))}
          </div>

          {status ? (
            <p className="rounded-md border border-gold/30 bg-black/50 p-3 text-sm font-semibold text-champagne">
              {status}
            </p>
          ) : null}
        </form>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-champagne">Mission Library</h3>
            <p className="text-sm font-semibold text-gold">
              {activeMissions.length} active
            </p>
          </div>

          {templates.length ? (
            <div className="mt-3 rounded-md border border-gold/25 bg-stone-950/70 p-3">
              <p className="text-sm font-bold uppercase text-stone-400">
                Reusable templates
              </p>
              <div className="mt-2 flex gap-2 overflow-auto pb-1">
                {templates.map((mission) => (
                  <button
                    key={mission.id}
                    type="button"
                    className="min-w-48 rounded-md border border-stone-700 p-3 text-left text-sm font-semibold text-stone-100 transition hover:border-gold"
                    onClick={() => applyTemplate(mission)}
                  >
                    <span className="block text-gold">{mission.category}</span>
                    {mission.prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-3 max-h-[30rem] space-y-2 overflow-auto pr-1">
            {missions.length ? (
              missions.map((mission) => (
                <article
                  key={mission.id}
                  className="rounded-md border border-stone-800 bg-stone-950/70 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gold">
                        {mission.category}
                        {mission.isTemplate ? " Template" : ""}
                      </p>
                      <p className="mt-2 leading-6 text-stone-100">
                        {mission.prompt}
                      </p>
                    </div>
                    <div className="grid shrink-0 gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-stone-700 px-3 py-2 text-sm font-bold text-champagne transition hover:border-gold"
                        onClick={() => editMission(mission)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/15"
                        onClick={() => handleDeleteMission(mission.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-gold/30 p-5 text-center text-stone-300">
                No missions yet. Add a few before launching a round.
              </p>
            )}
          </div>

          <Link
            href={guests[0] ? `/mission?id=${encodeURIComponent(guests[0].id)}` : "/mission"}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-stone-700 px-4 py-2 text-center text-sm font-bold text-champagne transition hover:border-gold"
          >
            Preview Guest Mission Page
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  detail
}: Readonly<{ label: string; value: string; detail?: string }>) {
  return (
    <div className="rounded-md border border-stone-800 bg-stone-950/70 p-4">
      <p className="text-sm uppercase text-stone-400">{label}</p>
      <p className="mt-2 text-4xl font-black text-gold">{value}</p>
      {detail ? <p className="mt-1 text-sm font-semibold text-stone-300">{detail}</p> : null}
    </div>
  );
}

function TemplateList({
  title,
  items,
  onApply
}: Readonly<{
  title: string;
  items: MissionSeed[];
  onApply: (mission: MissionSeed) => void;
}>) {
  return (
    <div className="rounded-md border border-stone-800 bg-black/35 p-3">
      <p className="text-xs font-bold uppercase text-gold">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <button
            key={item.prompt}
            type="button"
            className="w-full rounded-md border border-stone-800 px-3 py-2 text-left text-xs font-semibold leading-5 text-stone-200 transition hover:border-gold"
            onClick={() => onApply(item)}
          >
            {item.prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
