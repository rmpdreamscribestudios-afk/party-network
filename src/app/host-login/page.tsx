"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";
import { FormField } from "@/components/form-field";
import { grantHostAccess, HOST_PIN } from "@/lib/host-auth";

export default function HostLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // MVP-only host PIN. Production should use Supabase Auth or another
    // server-side authentication layer instead of a client-side shared PIN.
    if (pin === HOST_PIN) {
      grantHostAccess();
      router.replace("/host");
      return;
    }

    setError("Incorrect host PIN.");
  }

  return (
    <ExperienceShell
      eyebrow="Host Access"
      title="Party Network"
      subtitle="Enter the host PIN to open the control dashboard."
      align="left"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          required
          label="Host PIN"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={pin}
          onChange={(event) => {
            setPin(event.target.value);
            setError("");
          }}
          placeholder="Enter PIN"
        />
        {error ? (
          <p className="rounded-md border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-100">
            {error}
          </p>
        ) : null}
        <button type="submit" className={primaryActionClassName}>
          Login Host
        </button>
        <button
          type="button"
          className={secondaryActionClassName}
          onClick={() => router.push("/join")}
        >
          Back to Join
        </button>
      </form>
    </ExperienceShell>
  );
}
