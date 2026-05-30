"use client";

import { useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";

export default function GrandPrizePage() {
  const [revealed, setRevealed] = useState(false);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 text-center">
      {revealed ? <div className="confetti-field" /> : null}
      <section className="relative z-10 w-full max-w-5xl">
        <p className="text-lg font-bold uppercase text-gold">Final Reveal</p>
        <h1 className="mt-4 text-5xl font-black text-champagne md:text-8xl">
          PANGKABUHAYAN SHOWCASE GRAND PRIZE
        </h1>
        <div className="mx-auto mt-10 rounded-md border border-gold/40 bg-black/55 p-8 shadow-gold backdrop-blur">
          <p className="text-6xl font-black text-gold md:text-9xl">
            {revealed ? "8KG RICE" : "????"}
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className={primaryActionClassName}
          >
            Final Reveal
          </button>
          <Link href="/message" className={secondaryActionClassName}>
            Host Message
          </Link>
        </div>
      </section>
    </main>
  );
}
