"use client";

import { createClient } from "@supabase/supabase-js";
import type { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import {
  addLocalGuest,
  clearLocalGuests,
  deleteLocalGuest,
  readLocalGuestById,
  readLocalGuests
} from "@/lib/party-storage";
import type { PartyGuest } from "@/lib/party-storage";

type GuestRow = {
  id: string;
  name: string;
  first_name?: string | null;
  interests?: string | null;
  favorite_hobby?: string | null;
  fun_fact?: string | null;
  funny_answer: string | null;
  luck_score: number;
  created_at: string;
};

type GuestInsert = {
  name: string;
  first_name?: string | null;
  interests?: string | null;
  favorite_hobby?: string | null;
  fun_fact?: string | null;
  funny_answer?: string | null;
  luck_score: number;
};

type GuestListResult = {
  data: GuestRow[] | null;
  error: PostgrestError | null;
};

type GuestSingleResult = {
  data: GuestRow | null;
  error: PostgrestError | null;
};

const baseGuestSelect = "id, name, funny_answer, luck_score, created_at";
const profileGuestSelect =
  "id, name, first_name, interests, favorite_hobby, fun_fact, funny_answer, luck_score, created_at";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

function mapGuest(row: GuestRow): PartyGuest {
  return {
    id: row.id,
    name: row.name,
    firstName: row.first_name ?? undefined,
    interests: row.interests ?? undefined,
    favoriteHobby: row.favorite_hobby ?? undefined,
    funFact: row.fun_fact ?? undefined,
    answer: row.funny_answer ?? undefined,
    luckScore: row.luck_score,
    createdAt: row.created_at
  };
}

function isGuestRow(row: unknown): row is GuestRow {
  if (!row || typeof row !== "object") {
    return false;
  }

  const guest = row as Partial<GuestRow>;

  return (
    typeof guest.id === "string" &&
    typeof guest.name === "string" &&
    (guest.funny_answer === null || typeof guest.funny_answer === "string") &&
    typeof guest.luck_score === "number" &&
    typeof guest.created_at === "string"
  );
}

function toGuestRows(data: unknown): GuestRow[] | null {
  if (!Array.isArray(data)) {
    return null;
  }

  return data.filter(isGuestRow);
}

function toGuestRow(data: unknown): GuestRow | null {
  return isGuestRow(data) ? data : null;
}

function withLocalProfile(guest: PartyGuest): PartyGuest {
  const localGuest = readLocalGuestById(guest.id);

  return {
    ...guest,
    firstName: guest.firstName ?? localGuest?.firstName,
    interests: guest.interests ?? localGuest?.interests,
    favoriteHobby: guest.favoriteHobby ?? localGuest?.favoriteHobby,
    funFact: guest.funFact ?? localGuest?.funFact,
    answer: guest.answer ?? localGuest?.answer
  };
}

async function selectGuests(selectQuery: string): Promise<GuestListResult> {
  const { data, error } = await supabase!
    .from("guests")
    .select(selectQuery)
    .order("created_at", { ascending: false });

  return {
    data: toGuestRows(data),
    error
  };
}

async function selectGuestById(id: string, selectQuery: string): Promise<GuestSingleResult> {
  const { data, error } = await supabase!
    .from("guests")
    .select(selectQuery)
    .eq("id", id)
    .maybeSingle();

  return {
    data: toGuestRow(data),
    error
  };
}

async function insertGuestRow(payload: GuestInsert, selectQuery: string): Promise<GuestSingleResult> {
  const { data, error } = await supabase!
    .from("guests")
    .insert(payload)
    .select(selectQuery)
    .single();

  return {
    data: toGuestRow(data),
    error
  };
}

export async function fetchGuests(): Promise<PartyGuest[]> {
  if (!supabase) {
    return readLocalGuests();
  }

  try {
    let { data, error } = await selectGuests(profileGuestSelect);

    if (error) {
      const fallback = await selectGuests(baseGuestSelect);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return readLocalGuests();
    }

    const rows = Array.isArray(data) ? (data as GuestRow[]) : [];

    return rows.map(mapGuest).map(withLocalProfile);
  } catch {
    return readLocalGuests();
  }
}

export async function fetchGuestById(id: string): Promise<PartyGuest | undefined> {
  if (!supabase) {
    return readLocalGuestById(id);
  }

  try {
    let { data, error } = await selectGuestById(id, profileGuestSelect);

    if (error) {
      const fallback = await selectGuestById(id, baseGuestSelect);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return readLocalGuestById(id);
    }

    const row: GuestRow | null = data;

    return row ? withLocalProfile(mapGuest(row)) : readLocalGuestById(id);
  } catch {
    return readLocalGuestById(id);
  }
}

export async function insertGuest(guest: PartyGuest): Promise<PartyGuest> {
  if (!supabase) {
    return addLocalGuest(guest);
  }

  const payload: GuestInsert = {
    name: guest.name,
    first_name: guest.firstName ?? null,
    interests: guest.interests ?? null,
    favorite_hobby: guest.favoriteHobby ?? null,
    fun_fact: guest.funFact ?? null,
    funny_answer: guest.answer ?? null,
    luck_score: guest.luckScore
  };

  let { data, error } = await insertGuestRow(payload, profileGuestSelect);

  if (error) {
    const fallbackPayload: GuestInsert = {
      name: guest.name,
      funny_answer: guest.answer ?? null,
      luck_score: guest.luckScore
    };
    const fallback = await insertGuestRow(fallbackPayload, baseGuestSelect);

    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    throw error;
  }

  const insertedRow: GuestRow | null = toGuestRow(data);

  if (!insertedRow) {
    throw new Error("Supabase guest insert returned an invalid guest row.");
  }

  const insertedGuest = {
    ...mapGuest(insertedRow),
    firstName: guest.firstName,
    interests: guest.interests,
    favoriteHobby: guest.favoriteHobby,
    funFact: guest.funFact
  };

  addLocalGuest(insertedGuest);
  return insertedGuest;
}

export async function deleteGuest(id: string) {
  if (!supabase) {
    deleteLocalGuest(id);
    return;
  }

  const { error } = await supabase.from("guests").delete().eq("id", id);

  if (error) {
    throw error;
  }

  deleteLocalGuest(id);
}

export async function clearGuests() {
  if (!supabase) {
    clearLocalGuests();
    return;
  }

  const { error } = await supabase.from("guests").delete().not("id", "is", null);

  if (error) {
    throw error;
  }

  clearLocalGuests();
}

export function subscribeToGuestChanges(onChange: () => void): RealtimeChannel | null {
  if (!supabase) {
    return null;
  }

  return supabase
    .channel("party-network-guests")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "guests" },
      onChange
    )
    .subscribe();
}
