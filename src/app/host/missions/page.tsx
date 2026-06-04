"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { LogoHeader } from "@/components/logo";
import {
  ensureConnectionMissions,
  fetchMissionAssignmentStats,
  subscribeToMissionChanges
} from "@/lib/supabase-missions";
import type { MissionAssignmentStats } from "@/lib/supabase-missions";
import { fetchGuests } from "@/lib/supabase-guests";

const emptyStats: MissionAssignmentStats = {
  assigned: 0,
  completed: 0,
  completionPercentage: 0,
  assignments: []
};

export default function HostMissionsPage() {
  const [stats, setStats] = useState<MissionAssignmentStats>(emptyStats);
  const [guestCount, setGuestCount] = useState(0);
  const [status, setStatus] = useState("Loading mission activity...");
  const [isSeeding, setIsSeeding] = useState(false);

  const pending = useMemo(
    () => Math.max(stats.assigned - stats.completed, 0),
    [stats.assigned, stats.completed]
  );

  const loadDashboard = useCallback(async () => {
    try {
      const [nextStats, guests] = await Promise.all([
        fetchMissionAssignmentStats(),
        fetchGuests()
      ]);

      setStats(nextStats);
      setGuestCount(guests.length);
      setStatus("");
    } catch {
      setStatus("Could not load missions. Check the Supabase mission tables.");
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const channel = subscribeToMissionChanges(loadDashboard);
    const pollingId = window.setInterval(loadDashboard, 5000);

    return () => {
      channel?.unsubscribe();
      window.clearInterval(pollingId);
    };
  }, [loadDashboard]);

  async function handleSeedMissions() {
    setIsSeeding(true);
    setStatus("");

    try {
      await ensureConnectionMissions();
      await loadDashboard();
      setStatus("Connection Missions Engine v1 prompts are ready.");
    } catch {
      setStatus("Could not seed missions. Check the Supabase category check.");
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-party-teal/25 pb-6 md:flex-row md:items-end">
          <div>
            <LogoHeader size="md" className="mb-5" />
            <p className="text-sm font-black uppercase text-party-teal">
              Connection Missions Engine v1
            </p>
            <h1 className="mt-2 text-4xl font-black text-party-soft sm:text-6xl">
              Mission Control
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-200">
              Track one engagement mission per registered guest.
            </p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/host" className={secondaryActionClassName}>
              Host Dashboard
            </Link>
            <Link href="/join" className={primaryActionClassName}>
              Register Guest
            </Link>
          </nav>
        </header>

        <section className="pn-mission-card">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-party-gold">
                Live Progress
              </p>
              <h2 className="mt-2 text-2xl font-black text-party-soft">
                Human Engagement Platform
              </h2>
            </div>
            <button
              type="button"
              className={secondaryActionClassName}
              onClick={handleSeedMissions}
              disabled={isSeeding}
            >
              {isSeeding ? "Preparing..." : "Prepare v1 Missions"}
            </button>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-party-blue/25">
            <div
              className="h-full rounded-full bg-party-green transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <StatTile label="Registered guests" value={guestCount.toString()} />
            <StatTile label="Missions assigned" value={stats.assigned.toString()} />
            <StatTile label="Missions completed" value={stats.completed.toString()} />
            <StatTile label="Completion" value={`${stats.completionPercentage}%`} />
          </div>

          {status ? (
            <p className="pn-loading-state mt-5">
              {status}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="pn-dashboard-card">
            <p className="text-sm font-bold uppercase text-party-teal">
              At a glance
            </p>
            <div className="mt-5 grid gap-3">
              <StatusRow label="Assigned" value={stats.assigned} />
              <StatusRow label="Completed" value={stats.completed} />
              <StatusRow label="Still in motion" value={pending} />
            </div>
          </div>

          <div className="pn-dashboard-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-party-soft">
                Guest Missions
              </h2>
              <button
                type="button"
                className="rounded-md border border-party-blue/50 bg-white/[0.04] px-4 py-2 text-sm font-bold text-party-soft transition hover:border-party-teal"
                onClick={loadDashboard}
              >
                Refresh
              </button>
            </div>

            <div className="mt-5 max-h-[60vh] space-y-3 overflow-auto pr-1">
              {stats.assignments.length ? (
                stats.assignments.map((assignment) => (
                  <article
                    key={assignment.id}
                    className="rounded-md border border-party-blue/25 bg-party-navy/70 p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm font-black uppercase text-party-teal">
                          {assignment.guestName ?? "Guest"}
                        </p>
                        <h3 className="mt-2 text-xl font-black leading-tight text-party-soft">
                          {assignment.mission.prompt}
                        </h3>
                        <p className="mt-2 text-xs font-black uppercase text-party-gold">
                          {assignment.mission.category}
                        </p>
                      </div>
                      <span
                        className={`rounded-md border px-3 py-2 text-sm font-black ${
                          assignment.completedAt
                            ? "border-party-green/50 bg-party-green/15 text-green-100"
                            : "border-party-gold/45 bg-party-gold/10 text-party-gold"
                        }`}
                      >
                        {assignment.completedAt ? "Completed" : "Assigned"}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="pn-empty-state">
                  No mission assignments yet. Register a guest to begin.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatTile({
  label,
  value
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="pn-stat-card p-4">
      <p className="text-sm font-bold uppercase text-slate-300">{label}</p>
      <p className="mt-2 text-4xl font-black text-party-teal">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-party-blue/25 bg-party-navy/70 px-4 py-3">
      <span className="font-bold text-party-soft">{label}</span>
      <span className="text-2xl font-black text-party-gold">{value}</span>
    </div>
  );
}
