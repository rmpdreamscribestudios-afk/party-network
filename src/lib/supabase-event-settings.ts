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
  event_title?: string | null;
  event_subtitle?: string | null;
  event_date?: string | null;
  title?: string | null;
  subtitle?: string | null;
  date?: string | null;
};

type EventSettingsUpsert = {
  id: string;
  event_title: string;
  event_subtitle: string | null;
  event_date: string | null;
};

type LegacyEventSettingsUpsert = {
  id: string;
  title: string;
  subtitle: string | null;
  date: string | null;
};

export type EventSettingsLoadResult = {
  settings: EventSettings;
  hasEventSettings: boolean;
  source: "default" | "local" | "supabase";
};

export const EVENT_SETTINGS_ID = "current";
export const PARTY_EVENT_SETTINGS_KEY = "party-network-event-settings";

export const defaultEventSettings: EventSettings = {
  title: "Party Network",
  subtitle:
    "Add your name to the live wall, raffle pool, and prize reveal experience."
};

function getSettingsValue(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string") {
      return value.trim();
    }
  }

  return "";
}

function mapEventSettings(row: EventSettingsRow): EventSettings {
  return {
    title: getSettingsValue(row.event_title, row.title),
    subtitle: getSettingsValue(row.event_subtitle, row.subtitle),
    date: row.event_date ?? row.date ?? undefined
  };
}

function readLocalEventSettings(): EventSettingsLoadResult {
  if (typeof window === "undefined") {
    return {
      settings: defaultEventSettings,
      hasEventSettings: false,
      source: "default"
    };
  }

  try {
    const rawSettings = window.localStorage.getItem(PARTY_EVENT_SETTINGS_KEY);
    if (!rawSettings) {
      return {
        settings: defaultEventSettings,
        hasEventSettings: false,
        source: "default"
      };
    }

    const settings = JSON.parse(rawSettings) as Partial<EventSettings>;

    return {
      settings: {
        title: settings.title?.trim() ?? "",
        subtitle: settings.subtitle?.trim() ?? "",
        date: settings.date || undefined
      },
      hasEventSettings: true,
      source: "local"
    };
  } catch {
    return {
      settings: defaultEventSettings,
      hasEventSettings: false,
      source: "default"
    };
  }
}

function writeLocalEventSettings(settings: EventSettings) {
  window.localStorage.setItem(
    PARTY_EVENT_SETTINGS_KEY,
    JSON.stringify({
      title: settings.title.trim(),
      subtitle: settings.subtitle.trim(),
      date: settings.date || undefined
    })
  );
  emitPartyUpdate();
}

export async function fetchEventSettings(): Promise<EventSettings> {
  return (await fetchEventSettingsLoadResult()).settings;
}

export async function fetchEventSettingsLoadResult(): Promise<EventSettingsLoadResult> {
  if (!supabase) {
    return readLocalEventSettings();
  }

  const { data, error } = await supabase
    .from("event_settings")
    .select("*")
    .eq("id", EVENT_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? {
        settings: mapEventSettings(data),
        hasEventSettings: true,
        source: "supabase"
      }
    : {
        settings: defaultEventSettings,
        hasEventSettings: false,
        source: "default"
      };
}

export async function saveEventSettings(settings: EventSettings) {
  if (!supabase) {
    writeLocalEventSettings(settings);
    return;
  }

  const payload: EventSettingsUpsert = {
    id: EVENT_SETTINGS_ID,
    event_title: settings.title.trim(),
    event_subtitle: settings.subtitle.trim() || null,
    event_date: settings.date || null
  };

  const { error } = await supabase
    .from("event_settings")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (!error) {
    emitPartyUpdate();
    return;
  }

  const legacyPayload: LegacyEventSettingsUpsert = {
    id: EVENT_SETTINGS_ID,
    title: settings.title.trim(),
    subtitle: settings.subtitle.trim() || null,
    date: settings.date || null
  };

  const { error: legacyError } = await supabase
    .from("event_settings")
    .upsert(legacyPayload, { onConflict: "id" })
    .select("*")
    .single();

  if (legacyError) {
    throw legacyError;
  }

  emitPartyUpdate();
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
