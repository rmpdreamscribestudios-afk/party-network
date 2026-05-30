"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultEventSettings,
  EventSettings,
  fetchEventSettings,
  subscribeToEventSettingsChanges
} from "@/lib/supabase-event-settings";
import { PARTY_EVENT_UPDATE } from "@/lib/party-storage";

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings>(defaultEventSettings);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await fetchEventSettings());
      setError("");
    } catch {
      setSettings(defaultEventSettings);
      setError("Could not load event settings.");
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const channel = subscribeToEventSettingsChanges(loadSettings);
    window.addEventListener("storage", loadSettings);
    window.addEventListener(PARTY_EVENT_UPDATE, loadSettings);

    return () => {
      channel?.unsubscribe();
      window.removeEventListener("storage", loadSettings);
      window.removeEventListener(PARTY_EVENT_UPDATE, loadSettings);
    };
  }, [loadSettings]);

  return { settings, error, reloadSettings: loadSettings };
}
