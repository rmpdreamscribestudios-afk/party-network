"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-guests";

export type EventSettings = {
  title: string;
  subtitle: string;
  date?: string;
};

type EventSettingsRow = {
  id: string;
  event_title: string;
  event_subtitle: string | null;
  event_date: string | null;
};

type EventSettingsUpsert = {
  id: string;
  event_title: string;
  event_subtitle: string | null;
  event_date: string | null;
};

export const EVENT_SETTINGS_ID = "current";

export const defaultEventSettings: EventSettings = {
  title: "Party Network",
  subtitle:
    "A black and gold registration, live wall, raffle draw, and prize reveal experience for one unforgettable party."
};

function mapEventSettings(row: EventSettingsRow): EventSettings {
  return {
    title: row.event_title,
    subtitle: row.event_subtitle ?? "",
    date: row.event_date ?? undefined
  };
}

export async function fetchEventSettings(): Promise<EventSettings> {
  if (!supabase) {
    return defaultEventSettings;
  }

  const { data, error } = await supabase
    .from("event_settings")
    .select("id, event_title, event_subtitle, event_date")
    .eq("id", EVENT_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapEventSettings(data) : defaultEventSettings;
}

export async function saveEventSettings(settings: EventSettings) {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const payload: EventSettingsUpsert = {
    id: EVENT_SETTINGS_ID,
    event_title: settings.title.trim() || defaultEventSettings.title,
    event_subtitle: settings.subtitle.trim() || null,
    event_date: settings.date || null
  };

  const { error } = await supabase.from("event_settings").upsert(payload);

  if (error) {
    throw error;
  }
}

export function subscribeToEventSettingsChanges(
  onChange: () => void
): RealtimeChannel | null {
  if (!supabase) {
    return null;
  }

  return supabase
    .channel("party-network-event-settings")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "event_settings" },
      onChange
    )
    .subscribe();
}
