"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import {
  PARTY_EVENT_UPDATE,
  readRaffleState,
  writeRaffleState
} from "@/lib/party-storage";

export default function GrandPrizePage() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const syncState = () => setRevealed(readRaffleState().grandPrizeRevealed);

    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener(PARTY_EVENT_UPDATE, syncState);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(PARTY_EVENT_UPDATE, syncState);
    };
  }, []);

  function revealGrandPrize() {
    setRevealed(true);
    writeRaffleState({
      ...readRaffleState(),
      prizeId: "grand-rice",
      prizeRevealed: true,
      grandPrizeRevealed: true
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 text-center">
      {revealed ? <div className="confetti-field" /> : null}
      <section className="relative z-10 w-full max-w-5xl">
        <p className="text-lg font-bold uppercase text-party-teal">Final Reveal</p>
        <h1 className="mt-4 text-5xl font-black text-party-soft md:text-8xl">
          PANGKABUHAYAN SHOWCASE GRAND PRIZE
        </h1>
        <div className="pn-celebration-state mx-auto mt-10 p-8">
          <p className="text-6xl font-black text-party-gold md:text-9xl">
            {revealed ? "8KG RICE" : "????"}
          </p>
          {revealed ? (
            <p className="mx-auto mt-5 max-w-2xl text-xl leading-8 text-slate-100">
              The premium survival bundle has arrived. Heavy, practical, and
              completely unforgettable.
            </p>
          ) : null}
        </div>
        <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={revealGrandPrize}
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
