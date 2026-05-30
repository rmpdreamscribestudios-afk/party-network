"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultEventSettings,
  EventSettings,
  fetchEventSettings,
  subscribeToEventSettingsChanges
} from "@/lib/supabase-event-settings";

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings>(defaultEventSettings);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await fetchEventSettings());
      setError("");
    } catch {
      setSettings(defaultEventSettings);
      setError("Could not load event settings from Supabase.");
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const channel = subscribeToEventSettingsChanges(loadSettings);

    return () => {
      channel?.unsubscribe();
    };
  }, [loadSettings]);

  return { settings, error, reloadSettings: loadSettings };
}
