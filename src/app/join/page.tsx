"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { primaryActionClassName } from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { FormField } from "@/components/form-field";
import { addGuest, createGuest } from "@/lib/party-storage";

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    addGuest(createGuest(name, answer));
    router.push("/success");
  }

  return (
    <ExperienceShell eyebrow="Guest Access" title="Join the Experience" align="left">
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
        <button type="submit" className={primaryActionClassName}>
          Submit
        </button>
      </form>
    </ExperienceShell>
  );
}
