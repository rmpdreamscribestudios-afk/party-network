"use client";

import { createClient } from "@supabase/supabase-js";
import type { RealtimeChannel } from "@supabase/supabase-js";
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
  guest_name: string;
  funny_answer: string | null;
  luck_score: number;
  created_at: string;
};

type GuestInsert = {
  guest_name: string;
  funny_answer?: string | null;
  luck_score: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

function mapGuest(row: GuestRow): PartyGuest {
  return {
    id: row.id,
    name: row.guest_name,
    answer: row.funny_answer ?? undefined,
    luckScore: row.luck_score,
    createdAt: row.created_at
  };
}

export async function fetchGuests(): Promise<PartyGuest[]> {
  if (!supabase) {
    return readLocalGuests();
  }

  const { data, error } = await supabase
    .from("guests")
    .select("id, guest_name, funny_answer, luck_score, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapGuest);
}

export async function fetchGuestById(id: string): Promise<PartyGuest | undefined> {
  if (!supabase) {
    return readLocalGuestById(id);
  }

  const { data, error } = await supabase
    .from("guests")
    .select("id, guest_name, funny_answer, luck_score, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapGuest(data) : undefined;
}

export async function insertGuest(guest: PartyGuest): Promise<PartyGuest> {
  if (!supabase) {
    return addLocalGuest(guest);
  }

  const payload: GuestInsert = {
    guest_name: guest.name,
    funny_answer: guest.answer ?? null,
    luck_score: guest.luckScore
  };

  const { data, error } = await supabase
    .from("guests")
    .insert(payload)
    .select("id, guest_name, funny_answer, luck_score, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapGuest(data);
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
