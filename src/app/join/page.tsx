"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { primaryActionClassName } from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { FormField } from "@/components/form-field";
import { createGuest } from "@/lib/party-storage";
import { assignConnectionMissionToGuest } from "@/lib/supabase-missions";
import { insertGuest } from "@/lib/supabase-guests";
import { useEventSettings } from "@/lib/use-event-settings";

function getRegistrationErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const supabaseError = error as {
      message?: string;
    };

    if (supabaseError.message) {
      return supabaseError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error.";
}

export default function JoinPage() {
  const router = useRouter();
  const {
    eventSettings,
    hasEventSettings,
    isLoaded: areEventSettingsLoaded,
    error: eventSettingsError
  } = useEventSettings();
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [interests, setInterests] = useState("");
  const [favoriteHobby, setFavoriteHobby] = useState("");
  const [funFact, setFunFact] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const title = areEventSettingsLoaded ? eventSettings.title : "";
  const subtitle = areEventSettingsLoaded ? eventSettings.subtitle : "";

  useEffect(() => {
    console.log("[join] event_settings received", {
      eventSettings,
      hasEventSettings,
      isLoaded: areEventSettingsLoaded,
      error: eventSettingsError
    });
  }, [
    areEventSettingsLoaded,
    eventSettings,
    eventSettingsError,
    hasEventSettings
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const guest = await insertGuest(
        createGuest(name, {
          firstName,
          interests,
          favoriteHobby,
          funFact,
          answer
        })
      );
      try {
        await assignConnectionMissionToGuest(guest.id);
      } catch {
        // Registration should still succeed if the host has not installed
        // the Supabase mission tables yet.
      }
      router.push(`/confirmation?id=${encodeURIComponent(guest.id)}`);
    } catch (error) {
      setError(getRegistrationErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <ExperienceShell
      eyebrow="Guest Registration"
      title={title}
      subtitle={subtitle}
      align="left"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          required
          label="Guest Name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First Name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Optional"
          />
          <FormField
            label="Favorite Hobby"
            name="favoriteHobby"
            type="text"
            value={favoriteHobby}
            onChange={(event) => setFavoriteHobby(event.target.value)}
            placeholder="Basketball, cooking, karaoke"
          />
        </div>
        <FormField
          label="Interests"
          name="interests"
          type="text"
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          placeholder="Travel, food, games"
        />
        <FormField
          label="Fun Fact"
          name="funFact"
          type="text"
          value={funFact}
          onChange={(event) => setFunFact(event.target.value)}
          placeholder="One quick thing people can ask about"
        />
        <FormField
          label="If your luck had a theme song, what would it be?"
          name="answer"
          type="text"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Optional, but iconic"
        />
        {error ? (
          <p className="rounded-md border border-red-400/40 bg-red-950/30 p-3 text-sm font-semibold text-red-100">
            {error}
          </p>
        ) : null}
        <button type="submit" className={primaryActionClassName}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </ExperienceShell>
  );
}
