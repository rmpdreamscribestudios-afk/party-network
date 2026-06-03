"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-guests";
import { emitPartyUpdate } from "@/lib/party-storage";
import {
  defaultEventType,
  type EventType,
  isEventType
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
  subtitle:
    "Helping people connect, participate, and create meaningful memories together.",
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
  const localEventType = readLocalEventSettings().settings.eventType;
  const rowEventType = getSettingsValue(row.event_type, row.type);

  return {
    title: getSettingsValue(row.event_title, row.title),
    subtitle: getSettingsValue(row.event_subtitle, row.subtitle),
    date: row.event_date ?? row.date ?? undefined,
    eventType: isEventType(rowEventType) ? rowEventType : localEventType
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
        date: settings.date || undefined,
        eventType: isEventType(settings.eventType)
          ? settings.eventType
          : defaultEventType
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
      date: settings.date || undefined,
      eventType: settings.eventType
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
  if (typeof window !== "undefined") {
    writeLocalEventSettings(settings);
  }

  if (!supabase) {
    return;
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
