"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PartyGuest } from "@/lib/party-storage";
import { supabase } from "@/lib/supabase-guests";

export const missionCategories = [
  "INTRODUCTION",
  "DISCOVERY",
  "FRIENDSHIP",
  "TEAMWORK",
  "Icebreaker",
  "Friendship",
  "Family",
  "Team Building",
  "Community",
  "Kindness",
  "Meet Someone New",
  "Shared Interests",
  "Story Exchange",
  "Kindness Challenge",
  "Community Builder",
  "Team Connector"
] as const;

export type MissionCategory = (typeof missionCategories)[number];

export type Mission = {
  id: string;
  prompt: string;
  category: MissionCategory;
  isActive: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type MissionRound = {
  id: string;
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
  status: "active" | "completed";
};

export type GuestMission = {
  id: string;
  guestId: string;
  missionId: string;
  roundId: string;
  assignedAt: string;
  completedAt?: string;
  notes?: string;
  photoProofUrl?: string;
  mission: Mission;
};

export type MissionAssignment = GuestMission & {
  guestName?: string;
};

export type MissionRoundStats = {
  round?: MissionRound;
  totalGuests: number;
  assigned: number;
  completed: number;
  completionPercentage: number;
};

export type MissionAssignmentStats = {
  assigned: number;
  completed: number;
  completionPercentage: number;
  assignments: MissionAssignment[];
};

type MissionRow = {
  id: string;
  prompt: string;
  category: string | null;
  is_active: boolean | null;
  is_template: boolean | null;
  created_at: string;
  updated_at: string | null;
};

type MissionRoundRow = {
  id: string;
  started_at: string;
  ends_at: string;
  duration_minutes: number;
  status: string;
};

type GuestMissionRow = {
  id: string;
  guest_id: string;
  mission_id: string;
  round_id: string;
  assigned_at: string;
  completed_at: string | null;
  notes: string | null;
  photo_proof_url: string | null;
};

type GuestMissionWithMissionRow = GuestMissionRow & {
  missions: MissionRow | MissionRow[] | null;
};

type GuestMissionWithDetailsRow = GuestMissionWithMissionRow & {
  guests:
    | {
        name: string;
      }
    | Array<{
        name: string;
      }>
    | null;
};

export type MissionInput = {
  prompt: string;
  category: MissionCategory;
  isTemplate?: boolean;
  isActive?: boolean;
};

export type MissionCompletionInput = {
  notes?: string;
  photoProofUrl?: string;
};

export const missionExamples: MissionInput[] = [
  {
    prompt: "Introduce yourself to someone you have never met.",
    category: "INTRODUCTION",
    isTemplate: true
  },
  {
    prompt: "Learn a guest's first name.",
    category: "INTRODUCTION",
    isTemplate: true
  },
  {
    prompt: "Meet someone from a different table.",
    category: "INTRODUCTION",
    isTemplate: true
  },
  {
    prompt: "Find someone born in the same month.",
    category: "DISCOVERY",
    isTemplate: true
  },
  {
    prompt: "Find someone who travelled the farthest.",
    category: "DISCOVERY",
    isTemplate: true
  },
  {
    prompt: "Find someone attending their first event.",
    category: "DISCOVERY",
    isTemplate: true
  },
  {
    prompt: "Take a selfie with a new friend.",
    category: "FRIENDSHIP",
    isTemplate: true
  },
  {
    prompt: "Learn one interesting fact about another guest.",
    category: "FRIENDSHIP",
    isTemplate: true
  },
  {
    prompt: "Exchange contact information with someone new.",
    category: "FRIENDSHIP",
    isTemplate: true
  },
  {
    prompt: "Form a group of three strangers.",
    category: "TEAMWORK",
    isTemplate: true
  },
  {
    prompt: "Complete a challenge together.",
    category: "TEAMWORK",
    isTemplate: true
  },
  {
    prompt: "Introduce two people who have never met.",
    category: "TEAMWORK",
    isTemplate: true
  }
];

export const connectionMissionCategories: readonly MissionCategory[] = [
  "INTRODUCTION",
  "DISCOVERY",
  "FRIENDSHIP",
  "TEAMWORK"
] as const;

function isConnectionMissionCategory(
  category: MissionCategory
): category is (typeof connectionMissionCategories)[number] {
  return connectionMissionCategories.some(
    (connectionCategory) => connectionCategory === category
  );
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is required for mission rounds.");
  }

  return supabase;
}

function isMissionCategory(value?: string | null): value is MissionCategory {
  return missionCategories.includes(value as MissionCategory);
}

function mapMission(row: MissionRow): Mission {
  return {
    id: row.id,
    prompt: row.prompt,
    category: isMissionCategory(row.category) ? row.category : "Icebreaker",
    isActive: row.is_active ?? true,
    isTemplate: row.is_template ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined
  };
}

function mapMissionRound(row: MissionRoundRow): MissionRound {
  return {
    id: row.id,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes,
    status: row.status === "completed" ? "completed" : "active"
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
    notes: row.notes ?? undefined,
    photoProofUrl: row.photo_proof_url ?? undefined,
    mission
  };
}

function createRoundId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getGuestNameFromJoinedRow(row: GuestMissionWithDetailsRow) {
  const guestRow = Array.isArray(row.guests) ? row.guests[0] : row.guests;
  return guestRow?.name;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function getMissionFromJoinedRow(
  row: GuestMissionWithMissionRow
): Mission | undefined {
  const missionRow = Array.isArray(row.missions) ? row.missions[0] : row.missions;
  return missionRow ? mapMission(missionRow) : undefined;
}

export async function fetchMissions(): Promise<Mission[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("missions")
    .select("id, prompt, category, is_active, is_template, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMission);
}

export async function createMission(input: MissionInput): Promise<Mission> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("missions")
    .insert({
      prompt: input.prompt.trim(),
      category: input.category,
      is_template: input.isTemplate ?? false,
      is_active: input.isActive ?? true
    })
    .select("id, prompt, category, is_active, is_template, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return mapMission(data);
}

export async function ensureConnectionMissions(): Promise<Mission[]> {
  const existingMissions = await fetchMissions();
  const existingPrompts = new Set(
    existingMissions.map((mission) => mission.prompt.trim().toLowerCase())
  );
  const missingMissions = missionExamples.filter(
    (mission) => !existingPrompts.has(mission.prompt.trim().toLowerCase())
  );

  if (missingMissions.length) {
    await Promise.all(missingMissions.map((mission) => createMission(mission)));
  }

  const nextMissions = missingMissions.length ? await fetchMissions() : existingMissions;

  return nextMissions.filter((mission) =>
    isConnectionMissionCategory(mission.category)
  );
}

export async function updateMission(
  missionId: string,
  input: MissionInput
): Promise<Mission> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("missions")
    .update({
      prompt: input.prompt.trim(),
      category: input.category,
      is_template: input.isTemplate ?? false,
      is_active: input.isActive ?? true,
      updated_at: new Date().toISOString()
    })
    .eq("id", missionId)
    .select("id, prompt, category, is_active, is_template, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return mapMission(data);
}

export async function deleteMission(missionId: string) {
  const client = requireSupabase();
  const { error } = await client.from("missions").delete().eq("id", missionId);

  if (error) {
    throw error;
  }
}

export async function launchMissionRound(
  guests: PartyGuest[],
  missions: Mission[],
  durationMinutes: number
): Promise<string> {
  const client = requireSupabase();
  const activeMissions = missions.filter((mission) => mission.isActive);

  if (!guests.length) {
    throw new Error("Add guests before launching a mission round.");
  }

  if (!activeMissions.length) {
    throw new Error("Create at least one active mission before launching a round.");
  }

  const roundId = createRoundId();
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

  const { error: closeError } = await client
    .from("mission_rounds")
    .update({ status: "completed" })
    .eq("status", "active");

  if (closeError) {
    throw closeError;
  }

  const { error: roundError } = await client.from("mission_rounds").insert({
    id: roundId,
    started_at: startedAt.toISOString(),
    ends_at: endsAt.toISOString(),
    duration_minutes: durationMinutes,
    status: "active"
  });

  if (roundError) {
    throw roundError;
  }

  const randomizedMissions = shuffle(activeMissions);
  const assignments = guests.map((guest, index) => ({
    guest_id: guest.id,
    mission_id: randomizedMissions[index % randomizedMissions.length].id,
    round_id: roundId
  }));

  const { error } = await client.from("guest_missions").insert(assignments);

  if (error) {
    throw error;
  }

  return roundId;
}

async function fetchOrCreateConnectionRound(): Promise<MissionRound> {
  const client = requireSupabase();
  const { data: round, error } = await client
    .from("mission_rounds")
    .select("id, started_at, ends_at, duration_minutes, status")
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (round) {
    return mapMissionRound(round);
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + 15 * 60 * 1000);
  const { data: newRound, error: roundError } = await client
    .from("mission_rounds")
    .insert({
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
      duration_minutes: 15,
      status: "active"
    })
    .select("id, started_at, ends_at, duration_minutes, status")
    .single();

  if (roundError) {
    throw roundError;
  }

  return mapMissionRound(newRound);
}

function pickMissionForGuest(guestId: string, missions: Mission[]) {
  const seed = [...guestId].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return missions[seed % missions.length];
}

export async function assignConnectionMissionToGuest(
  guestId: string
): Promise<GuestMission | undefined> {
  const existingMission = await fetchLatestGuestMission(guestId);

  if (existingMission) {
    return existingMission;
  }

  const client = requireSupabase();
  const [round, missions] = await Promise.all([
    fetchOrCreateConnectionRound(),
    ensureConnectionMissions()
  ]);
  const activeMissions = missions.filter((mission) => mission.isActive);

  if (!activeMissions.length) {
    throw new Error("No active connection missions are available.");
  }

  const mission = pickMissionForGuest(guestId, activeMissions);
  const { error } = await client.from("guest_missions").insert({
    guest_id: guestId,
    mission_id: mission.id,
    round_id: round.id
  });

  if (error) {
    throw error;
  }

  return fetchLatestGuestMission(guestId);
}

export async function fetchLatestGuestMission(
  guestId: string
): Promise<GuestMission | undefined> {
  const client = requireSupabase();
  const { data: assignment, error } = await client
    .from("guest_missions")
    .select(
      "id, guest_id, mission_id, round_id, assigned_at, completed_at, notes, photo_proof_url, missions(id, prompt, category, is_active, is_template, created_at, updated_at)"
    )
    .eq("guest_id", guestId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!assignment) {
    return undefined;
  }

  const mission = getMissionFromJoinedRow(assignment as GuestMissionWithMissionRow);
  return mission ? mapGuestMission(assignment, mission) : undefined;
}

export async function completeGuestMission(
  guestMission: GuestMission,
  input: MissionCompletionInput
) {
  const client = requireSupabase();
  const completedAt = new Date().toISOString();
  const { error } = await client
    .from("guest_missions")
    .update({
      completed_at: completedAt,
      notes: input.notes?.trim() || null,
      photo_proof_url: input.photoProofUrl?.trim() || null
    })
    .eq("id", guestMission.id);

  if (error) {
    throw error;
  }
}

export async function fetchActiveMissionRoundStats(): Promise<MissionRoundStats> {
  const client = requireSupabase();
  const { data: round, error: roundError } = await client
    .from("mission_rounds")
    .select("id, started_at, ends_at, duration_minutes, status")
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (roundError) {
    throw roundError;
  }

  if (!round) {
    return {
      totalGuests: 0,
      assigned: 0,
      completed: 0,
      completionPercentage: 0
    };
  }

  const { count: assigned, error: assignedError } = await client
    .from("guest_missions")
    .select("id", { count: "exact", head: true })
    .eq("round_id", round.id);

  if (assignedError) {
    throw assignedError;
  }

  const { count: completed, error: completedError } = await client
    .from("guest_missions")
    .select("id", { count: "exact", head: true })
    .eq("round_id", round.id)
    .not("completed_at", "is", null);

  if (completedError) {
    throw completedError;
  }

  const nextAssigned = assigned ?? 0;
  const nextCompleted = completed ?? 0;

  return {
    round: mapMissionRound(round),
    totalGuests: nextAssigned,
    assigned: nextAssigned,
    completed: nextCompleted,
    completionPercentage: nextAssigned
      ? Math.round((nextCompleted / nextAssigned) * 100)
      : 0
  };
}

export async function fetchMissionAssignmentStats(): Promise<MissionAssignmentStats> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("guest_missions")
    .select(
      "id, guest_id, mission_id, round_id, assigned_at, completed_at, notes, photo_proof_url, missions(id, prompt, category, is_active, is_template, created_at, updated_at), guests(name)"
    )
    .order("assigned_at", { ascending: false });

  if (error) {
    throw error;
  }

  const assignments = ((data ?? []) as GuestMissionWithDetailsRow[])
    .map((row) => {
      const mission = getMissionFromJoinedRow(row);

      if (!mission || !isConnectionMissionCategory(mission.category)) {
        return undefined;
      }

      return {
        ...mapGuestMission(row, mission),
        guestName: getGuestNameFromJoinedRow(row)
      };
    })
    .filter((assignment): assignment is MissionAssignment => Boolean(assignment));
  const completed = assignments.filter((assignment) => assignment.completedAt).length;

  return {
    assigned: assignments.length,
    completed,
    completionPercentage: assignments.length
      ? Math.round((completed / assignments.length) * 100)
      : 0,
    assignments
  };
}

export function getMissionRoundTimeLeft(round?: MissionRound): string {
  if (!round) {
    return "--:--";
  }

  const remainingMs = Math.max(0, new Date(round.endsAt).getTime() - Date.now());
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
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
      { event: "*", schema: "public", table: "mission_rounds" },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "guest_missions" },
      onChange
    )
    .subscribe();
}
