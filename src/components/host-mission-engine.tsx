"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { FormField } from "@/components/form-field";
import type { PartyGuest } from "@/lib/party-storage";
import { isSupabaseConfigured } from "@/lib/supabase-guests";
import {
  createMission,
  fetchMissions,
  launchMissionRound,
  missionExamples,
  subscribeToMissionChanges
} from "@/lib/supabase-missions";
import type { Mission } from "@/lib/supabase-missions";

type HostMissionEngineProps = Readonly<{
  guests: PartyGuest[];
}>;

export function HostMissionEngine({ guests }: HostMissionEngineProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const loadMissions = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus("Supabase is required for mission rounds.");
      return;
    }

    setIsLoading(true);

    try {
      setMissions(await fetchMissions());
    } catch {
      setStatus("Could not load missions. Check the Supabase mission tables.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
    const channel = subscribeToMissionChanges(loadMissions);

    return () => {
      channel?.unsubscribe();
    };
  }, [loadMissions]);

  async function handleCreateMission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPrompt = prompt.trim();

    if (!nextPrompt) {
      return;
    }

    setStatus("");
    setIsCreating(true);

    try {
      await createMission(nextPrompt);
      setPrompt("");
      setStatus("Mission created.");
      await loadMissions();
    } catch {
      setStatus("Could not create mission.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleLaunchRound() {
    setStatus("");
    setIsLaunching(true);

    try {
      await launchMissionRound(guests, missions);
      setStatus(`Mission round launched for ${guests.length} guests.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not launch round.");
    } finally {
      setIsLaunching(false);
    }
  }

  function useExample(example: string) {
    setPrompt(example);
  }

  return (
    <section className="rounded-md border border-gold/30 bg-black/45 p-5 md:col-span-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase text-stone-400">Mission Engine</p>
          <h2 className="mt-1 text-2xl font-bold text-champagne">
            Real-world Guest Missions
          </h2>
        </div>
        <button
          type="button"
          className={primaryActionClassName}
          onClick={handleLaunchRound}
          disabled={isLaunching || !guests.length || !missions.length}
        >
          {isLaunching ? "Launching..." : "Launch Mission Round"}
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <form onSubmit={handleCreateMission} className="space-y-4">
          <FormField
            required
            label="New Mission"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Give someone a kind compliment."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className={primaryActionClassName}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Mission"}
            </button>
            <button
              type="button"
              className={secondaryActionClassName}
              onClick={loadMissions}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {missionExamples.map((example) => (
              <button
                key={example}
                type="button"
                className="rounded-md border border-stone-700 px-3 py-2 text-left text-sm font-semibold text-stone-200 transition hover:border-gold"
                onClick={() => useExample(example)}
              >
                {example}
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
            <h3 className="text-lg font-bold text-champagne">Mission List</h3>
            <p className="text-sm font-semibold text-gold">
              {missions.length} total
            </p>
          </div>
          <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
            {missions.length ? (
              missions.map((mission) => (
                <article
                  key={mission.id}
                  className="rounded-md border border-stone-800 bg-stone-950/70 p-3"
                >
                  <p className="leading-6 text-stone-100">{mission.prompt}</p>
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
