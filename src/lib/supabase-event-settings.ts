"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-guests";
import { emitPartyUpdate } from "@/lib/party-storage";

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
export const PARTY_EVENT_SETTINGS_KEY = "party-network-event-settings";

export const defaultEventSettings: EventSettings = {
  title: "Party Network",
  subtitle:
    "Add your name to the live wall, raffle pool, and prize reveal experience."
};

function mapEventSettings(row: EventSettingsRow): EventSettings {
  return {
    title: row.event_title.trim() || defaultEventSettings.title,
    subtitle: row.event_subtitle?.trim() || defaultEventSettings.subtitle,
    date: row.event_date ?? undefined
  };
}

function readLocalEventSettings(): EventSettings {
  if (typeof window === "undefined") {
    return defaultEventSettings;
  }

  try {
    const rawSettings = window.localStorage.getItem(PARTY_EVENT_SETTINGS_KEY);
    if (!rawSettings) {
      return defaultEventSettings;
    }

    const settings = JSON.parse(rawSettings) as Partial<EventSettings>;

    return {
      title: settings.title?.trim() || defaultEventSettings.title,
      subtitle: settings.subtitle?.trim() || defaultEventSettings.subtitle,
      date: settings.date || undefined
    };
  } catch {
    return defaultEventSettings;
  }
}

function writeLocalEventSettings(settings: EventSettings) {
  window.localStorage.setItem(
    PARTY_EVENT_SETTINGS_KEY,
    JSON.stringify({
      title: settings.title.trim() || defaultEventSettings.title,
      subtitle: settings.subtitle.trim() || defaultEventSettings.subtitle,
      date: settings.date || undefined
    })
  );
  emitPartyUpdate();
}

export async function fetchEventSettings(): Promise<EventSettings> {
  if (!supabase) {
    return readLocalEventSettings();
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
    writeLocalEventSettings(settings);
    return;
  }

  const payload: EventSettingsUpsert = {
    id: EVENT_SETTINGS_ID,
    event_title: settings.title.trim() || defaultEventSettings.title,
    event_subtitle: settings.subtitle.trim() || defaultEventSettings.subtitle,
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
