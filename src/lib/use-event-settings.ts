"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultEventSettings,
  EventSettings,
  fetchEventSettingsLoadResult,
  subscribeToEventSettingsChanges
} from "@/lib/supabase-event-settings";
import { PARTY_EVENT_UPDATE } from "@/lib/party-storage";

export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings>(defaultEventSettings);
  const [hasEventSettings, setHasEventSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      const result = await fetchEventSettingsLoadResult();
      setSettings(result.settings);
      setHasEventSettings(result.hasEventSettings);
      setIsLoaded(true);
      setError("");
    } catch {
      setSettings(defaultEventSettings);
      setHasEventSettings(false);
      setIsLoaded(true);
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

  return {
    settings,
    eventSettings: settings,
    hasEventSettings,
    isLoaded,
    error,
    reloadSettings: loadSettings
  };
}
