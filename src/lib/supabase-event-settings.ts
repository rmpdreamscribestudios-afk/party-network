"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-guests";
import { emitPartyUpdate } from "@/lib/party-storage";
import {
  defaultEventType,
  type EventType,
  getSafeEventType
} from "@/lib/event-templates";

export type EventSettings = {
  title: string;
  subtitle: string;
  date?: string;
  eventType: EventType;
};

type EventSettingsRow = {
  id: string;
  event_title?: string | null;
  event_subtitle?: string | null;
  event_date?: string | null;
  event_type?: string | null;
  title?: string | null;
  subtitle?: string | null;
  date?: string | null;
  type?: string | null;
};

type EventSettingsUpsert = {
  id: string;
  event_title: string;
  event_subtitle: string | null;
  event_date: string | null;
  event_type: EventType;
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
  subtitle: "Less Scrolling. More Connecting.",
  eventType: defaultEventType
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
  const rowEventType = getSettingsValue(row.event_type, row.type);
  const title = getSettingsValue(row.event_title, row.title);
  const subtitle = getSettingsValue(row.event_subtitle, row.subtitle);

  return {
    title: title || defaultEventSettings.title,
    subtitle: subtitle || defaultEventSettings.subtitle,
    date: row.event_date ?? row.date ?? undefined,
    eventType: getSafeEventType(rowEventType, defaultEventType)
  };
}

function clearLocalEventSettings() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PARTY_EVENT_SETTINGS_KEY);
  }
}

export async function fetchEventSettings(): Promise<EventSettings> {
  return (await fetchEventSettingsLoadResult()).settings;
}

export async function fetchEventSettingsLoadResult(): Promise<EventSettingsLoadResult> {
  clearLocalEventSettings();

  if (!supabase) {
    return {
      settings: defaultEventSettings,
      hasEventSettings: false,
      source: "default"
    };
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
  clearLocalEventSettings();

  if (!supabase) {
    throw new Error("Supabase is not configured. Event settings can only be saved to the event_settings table.");
  }

  const payload: EventSettingsUpsert = {
    id: EVENT_SETTINGS_ID,
    event_title: settings.title.trim(),
    event_subtitle: settings.subtitle.trim() || null,
    event_date: settings.date || null,
    event_type: settings.eventType
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

  const eventColumnsOnlyPayload = {
    id: EVENT_SETTINGS_ID,
    event_title: settings.title.trim(),
    event_subtitle: settings.subtitle.trim() || null,
    event_date: settings.date || null
  };

  const { error: eventColumnsOnlyError } = await supabase
    .from("event_settings")
    .upsert(eventColumnsOnlyPayload, { onConflict: "id" })
    .select("*")
    .single();

  if (!eventColumnsOnlyError) {
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
    throw new Error(legacyError.message || eventColumnsOnlyError.message || error.message);
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
