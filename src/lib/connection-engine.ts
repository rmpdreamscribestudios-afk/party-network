"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  type PartyGuest,
  emitPartyUpdate
} from "@/lib/party-storage";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-guests";

export type ConnectionMission = {
  id: string;
  category: ConnectionMissionCategory;
  prompt: string;
};

export type ConnectionMissionCategory =
  | "Meet Someone New"
  | "Shared Interests"
  | "Story Exchange"
  | "Kindness Challenge"
  | "Community Builder"
  | "Team Connector";

export type ConnectionRecord = {
  id: string;
  guestId: string;
  metGuestId?: string;
  personFirstName?: string;
  missionId: string;
  reflection?: string;
  createdAt: string;
};

export type MatchSuggestion = {
  guest: PartyGuest;
  message: string;
};

export type ConnectionStats = {
  connectionsCreated: number;
  participationRate: number;
  mostCompletedMission: string;
  missionsCompleted: number;
  newPeopleMet: number;
  activeParticipants: number;
  topMissionCategories: Array<{
    category: ConnectionMissionCategory;
    count: number;
  }>;
};

type ConnectionRecordRow = {
  id: string;
  guest_id: string;
  met_guest_id: string | null;
  person_first_name?: string | null;
  mission_id: string;
  reflection?: string | null;
  created_at: string;
};

export const PARTY_CONNECTIONS_KEY = "party-network-connections";

export const connectionMissions: ConnectionMission[] = [
  {
    id: "introduce-new",
    category: "Meet Someone New",
    prompt: "Introduce yourself to someone you haven't met."
  },
  {
    id: "learn-hometown",
    category: "Meet Someone New",
    prompt: "Learn their hometown."
  },
  {
    id: "shared-hobby",
    category: "Shared Interests",
    prompt: "Find someone who enjoys the same hobby."
  },
  {
    id: "same-food",
    category: "Shared Interests",
    prompt: "Find someone who likes the same food."
  },
  {
    id: "memorable-moment",
    category: "Story Exchange",
    prompt: "Ask someone about a memorable life moment."
  },
  {
    id: "lesson-earlier",
    category: "Story Exchange",
    prompt: "Learn one lesson they wish they knew earlier."
  },
  {
    id: "genuine-compliment",
    category: "Kindness Challenge",
    prompt: "Give a genuine compliment."
  },
  {
    id: "thank-someone",
    category: "Kindness Challenge",
    prompt: "Thank someone for something they do."
  },
  {
    id: "introduce-two-people",
    category: "Community Builder",
    prompt: "Introduce two people who don't know each other."
  },
  {
    id: "welcome-newcomer",
    category: "Community Builder",
    prompt: "Welcome a newcomer."
  },
  {
    id: "team-role",
    category: "Team Connector",
    prompt: "Meet someone whose role or strengths are different from yours."
  },
  {
    id: "team-goal",
    category: "Team Connector",
    prompt: "Find someone who can help with a shared team goal."
  }
];

function normalize(value?: string) {
  return value?.trim().toLowerCase();
}

function splitInterests(value?: string) {
  return (value ?? "")
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean);
}

function getGuestDisplayName(guest: PartyGuest) {
  return guest.firstName || guest.name.split(" ")[0] || guest.name;
}

function createConnectionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mapConnectionRecord(row: ConnectionRecordRow): ConnectionRecord {
  return {
    id: row.id,
    guestId: row.guest_id,
    metGuestId: row.met_guest_id ?? undefined,
    personFirstName: row.person_first_name ?? undefined,
    missionId: row.mission_id,
    reflection: row.reflection ?? undefined,
    createdAt: row.created_at
  };
}

export function readConnectionRecords(): ConnectionRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawRecords = window.localStorage.getItem(PARTY_CONNECTIONS_KEY);
    if (!rawRecords) {
      return [];
    }

    return (JSON.parse(rawRecords) as ConnectionRecord[]).filter(
      (record) => record.id && record.guestId && record.missionId
    );
  } catch {
    return [];
  }
}

export function writeConnectionRecords(records: ConnectionRecord[]) {
  window.localStorage.setItem(PARTY_CONNECTIONS_KEY, JSON.stringify(records));
  emitPartyUpdate();
}

export function addConnectionRecord(input: {
  guestId: string;
  metGuestId?: string;
  personFirstName?: string;
  missionId: string;
  reflection?: string;
}) {
  writeConnectionRecords([
    {
      id: createConnectionId(),
      guestId: input.guestId,
      metGuestId: input.metGuestId,
      personFirstName: input.personFirstName?.trim() || undefined,
      missionId: input.missionId,
      reflection: input.reflection?.trim() || undefined,
      createdAt: new Date().toISOString()
    },
    ...readConnectionRecords()
  ]);
}

export async function fetchConnectionRecords(): Promise<ConnectionRecord[]> {
  if (!supabase) {
    return readConnectionRecords();
  }

  try {
    const { data, error } = await supabase
      .from("connection_records")
      .select(
        "id, guest_id, met_guest_id, person_first_name, mission_id, reflection, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      const { data: legacyData, error: legacyError } = await supabase
        .from("connection_records")
        .select("id, guest_id, met_guest_id, mission_id, created_at")
        .order("created_at", { ascending: false });

      if (legacyError) {
        return readConnectionRecords();
      }

      return (legacyData ?? []).map(mapConnectionRecord);
    }

    return (data ?? []).map(mapConnectionRecord);
  } catch {
    return readConnectionRecords();
  }
}

export async function createConnectionRecord(input: {
  guestId: string;
  metGuestId?: string;
  personFirstName?: string;
  missionId: string;
  reflection?: string;
}) {
  if (!supabase) {
    addConnectionRecord(input);
    return;
  }

  try {
    const payload = {
      guest_id: input.guestId,
      met_guest_id: input.metGuestId || null,
      person_first_name: input.personFirstName?.trim() || null,
      mission_id: input.missionId,
      reflection: input.reflection?.trim() || null
    };
    const { error } = await supabase.from("connection_records").insert(payload);

    if (error) {
      const { error: legacyError } = await supabase.from("connection_records").insert({
        guest_id: input.guestId,
        met_guest_id: input.metGuestId || null,
        mission_id: input.missionId
      });

      if (legacyError) {
        addConnectionRecord(input);
      }
    }
  } catch {
    addConnectionRecord(input);
  }
}

export function clearConnectionRecords() {
  window.localStorage.removeItem(PARTY_CONNECTIONS_KEY);
  emitPartyUpdate();
}

export async function clearAllConnectionRecords() {
  clearConnectionRecords();

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    await supabase.from("connection_records").delete().not("id", "is", null);
  } catch {
    // Local reset should still succeed when the optional table is not installed.
  }
}

export function getMatchSuggestion(
  guest: PartyGuest,
  guests: PartyGuest[]
): MatchSuggestion | undefined {
  const otherGuests = guests.filter((otherGuest) => otherGuest.id !== guest.id);
  const hobby = normalize(guest.favoriteHobby);

  if (hobby) {
    const hobbyMatch = otherGuests.find(
      (otherGuest) => normalize(otherGuest.favoriteHobby) === hobby
    );

    if (hobbyMatch) {
      return {
        guest: hobbyMatch,
        message: `You and ${getGuestDisplayName(
          hobbyMatch
        )} both enjoy ${guest.favoriteHobby}.`
      };
    }
  }

  const interests = splitInterests(guest.interests);
  for (const interest of interests) {
    const interestMatch = otherGuests.find((otherGuest) =>
      splitInterests(otherGuest.interests).some(
        (otherInterest) => normalize(otherInterest) === normalize(interest)
      )
    );

    if (interestMatch) {
      return {
        guest: interestMatch,
        message: `You and ${getGuestDisplayName(
          interestMatch
        )} both selected ${interest}.`
      };
    }
  }

  return otherGuests[0]
    ? {
        guest: otherGuests[0],
        message: `Start with ${getGuestDisplayName(
          otherGuests[0]
        )}. Learn one thing you would not guess from a name tag.`
      }
    : undefined;
}

export function getConnectionStats(
  guests: PartyGuest[],
  records = readConnectionRecords()
): ConnectionStats {
  const participantIds = new Set(records.map((record) => record.guestId));
  const newPeopleMet = new Set(
    records.flatMap((record) =>
      record.metGuestId ? [record.guestId, record.metGuestId] : [record.guestId]
    )
  ).size;
  const missionCounts = new Map<string, number>();
  const categoryCounts = new Map<ConnectionMissionCategory, number>();

  records.forEach((record) => {
    missionCounts.set(
      record.missionId,
      (missionCounts.get(record.missionId) ?? 0) + 1
    );

    const mission = connectionMissions.find(
      (nextMission) => nextMission.id === record.missionId
    );

    if (mission) {
      categoryCounts.set(
        mission.category,
        (categoryCounts.get(mission.category) ?? 0) + 1
      );
    }
  });

  const mostCompletedMissionId = [...missionCounts.entries()].sort(
    (first, second) => second[1] - first[1]
  )[0]?.[0];
  const mostCompletedMission =
    connectionMissions.find((mission) => mission.id === mostCompletedMissionId)
      ?.prompt ?? "Pending";

  return {
    connectionsCreated: records.length,
    participationRate: guests.length
      ? Math.round((participantIds.size / guests.length) * 100)
      : 0,
    mostCompletedMission,
    missionsCompleted: records.length,
    newPeopleMet,
    activeParticipants: participantIds.size,
    topMissionCategories: [...categoryCounts.entries()]
      .sort((first, second) => second[1] - first[1])
      .slice(0, 4)
      .map(([category, count]) => ({ category, count }))
  };
}

export function subscribeToConnectionChanges(
  onChange: () => void
): RealtimeChannel | null {
  if (!supabase) {
    return null;
  }

  return supabase
    .channel("party-network-connections")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "connection_records" },
      onChange
    )
    .subscribe();
}
