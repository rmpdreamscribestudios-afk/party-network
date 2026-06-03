"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PartyGuest } from "@/lib/party-storage";
import { supabase } from "@/lib/supabase-guests";

export type Mission = {
  id: string;
  prompt: string;
  isActive: boolean;
  createdAt: string;
};

export type GuestMission = {
  id: string;
  guestId: string;
  missionId: string;
  roundId: string;
  assignedAt: string;
  completedAt?: string;
  mission: Mission;
};

type MissionRow = {
  id: string;
  prompt: string;
  is_active: boolean;
  created_at: string;
};

type GuestMissionRow = {
  id: string;
  guest_id: string;
  mission_id: string;
  round_id: string;
  assigned_at: string;
  completed_at: string | null;
};

type MissionCompletionInsert = {
  guest_mission_id: string;
  guest_id: string;
  mission_id: string;
};

export const missionExamples = [
  "Meet someone from another table.",
  "Find someone wearing blue.",
  "Learn one new thing about a guest.",
  "Give someone a kind compliment.",
  "Take a group photo with someone new."
];

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is required for missions.");
  }

  return supabase;
}

function mapMission(row: MissionRow): Mission {
  return {
    id: row.id,
    prompt: row.prompt,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

function mapGuestMission(row: GuestMissionRow, mission: Mission): GuestMission {
  return {
    id: row.id,
    guestId: row.guest_id,
    missionId: row.mission_id,
    roundId: row.round_id,
    assignedAt: row.assigned_at,
    completedAt: row.completed_at ?? undefined,
    mission
  };
}

function createRoundId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function fetchMissions(): Promise<Mission[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("missions")
    .select("id, prompt, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMission);
}

export async function createMission(prompt: string): Promise<Mission> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("missions")
    .insert({ prompt: prompt.trim() })
    .select("id, prompt, is_active, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapMission(data);
}

export async function launchMissionRound(
  guests: PartyGuest[],
  missions: Mission[]
): Promise<string> {
  const client = requireSupabase();
  const activeMissions = missions.filter((mission) => mission.isActive);

  if (!guests.length) {
    throw new Error("Add guests before launching a mission round.");
  }

  if (!activeMissions.length) {
    throw new Error("Create at least one mission before launching a round.");
  }

  const roundId = createRoundId();
  const assignments = guests.map((guest) => {
    const mission =
      activeMissions[Math.floor(Math.random() * activeMissions.length)];

    return {
      guest_id: guest.id,
      mission_id: mission.id,
      round_id: roundId
    };
  });

  const { error } = await client.from("guest_missions").insert(assignments);

  if (error) {
    throw error;
  }

  return roundId;
}

export async function fetchLatestGuestMission(
  guestId: string
): Promise<GuestMission | undefined> {
  const client = requireSupabase();
  const { data: assignment, error: assignmentError } = await client
    .from("guest_missions")
    .select("id, guest_id, mission_id, round_id, assigned_at, completed_at")
    .eq("guest_id", guestId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignment) {
    return undefined;
  }

  const { data: mission, error: missionError } = await client
    .from("missions")
    .select("id, prompt, is_active, created_at")
    .eq("id", assignment.mission_id)
    .single();

  if (missionError) {
    throw missionError;
  }

  return mapGuestMission(assignment, mapMission(mission));
}

export async function completeGuestMission(guestMission: GuestMission) {
  const client = requireSupabase();
  const completedAt = new Date().toISOString();
  const completion: MissionCompletionInsert = {
    guest_mission_id: guestMission.id,
    guest_id: guestMission.guestId,
    mission_id: guestMission.missionId
  };

  const { error: completionError } = await client
    .from("mission_completions")
    .upsert(completion, { onConflict: "guest_mission_id" });

  if (completionError) {
    throw completionError;
  }

  const { error: assignmentError } = await client
    .from("guest_missions")
    .update({ completed_at: completedAt })
    .eq("id", guestMission.id);

  if (assignmentError) {
    throw assignmentError;
  }
}

export function subscribeToMissionChanges(
  onChange: () => void
): RealtimeChannel | null {
  if (!supabase) {
    return null;
  }

  return supabase
    .channel("party-network-missions")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "missions" },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "guest_missions" },
      onChange
    )
    .subscribe();
}
