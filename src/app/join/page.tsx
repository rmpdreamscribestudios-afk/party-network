"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { primaryActionClassName } from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { FormField } from "@/components/form-field";
import { createGuest } from "@/lib/party-storage";
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
  const { settings } = useEventSettings();
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const guest = await insertGuest(createGuest(name, answer));
      router.push(`/confirmation?id=${encodeURIComponent(guest.id)}`);
    } catch (error) {
      setError(getRegistrationErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <ExperienceShell
      eyebrow="Guest Registration"
      title={settings.title}
      subtitle="Add your name to the live wall, raffle pool, and prize reveal experience."
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
