"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { LogoHeader } from "@/components/logo";
import {
  defaultPrizes,
  getPrizeById,
  PARTY_EVENT_UPDATE,
  Prize,
  readRaffleState,
  writeRaffleState
} from "@/lib/party-storage";

export default function PrizePage() {
  const regularPrizes = useMemo(
    () => defaultPrizes.filter((prize) => !prize.isGrand),
    []
  );
  const [prize, setPrize] = useState<Prize>(regularPrizes[0]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const syncState = () => {
      const state = readRaffleState();
      const storedPrize = getPrizeById(state.prizeId);
      setPrize(storedPrize.isGrand ? regularPrizes[0] : storedPrize);
      setRevealed(state.prizeRevealed);
    };

    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener(PARTY_EVENT_UPDATE, syncState);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(PARTY_EVENT_UPDATE, syncState);
    };
  }, [regularPrizes]);

  function choosePrize() {
    const nextPrize = regularPrizes[Math.floor(Math.random() * regularPrizes.length)];
    setPrize(nextPrize);
    setRevealed(false);
    writeRaffleState({
      ...readRaffleState(),
      prizeId: nextPrize.id,
      prizeRevealed: false,
      grandPrizeRevealed: false
    });
  }

  function revealPrize() {
    setRevealed(true);
    writeRaffleState({
      ...readRaffleState(),
      prizeId: prize.id,
      prizeRevealed: true,
      grandPrizeRevealed: false
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 text-center">
      <div className="premium-orbit opacity-40" />
      <section className="relative z-10 w-full max-w-4xl">
        <LogoHeader size="md" className="mx-auto mb-6" />
        <p className="text-lg font-bold uppercase text-party-teal">Prize Reveal</p>
        <h1 className="mt-4 text-5xl font-black text-party-soft md:text-8xl">
          {prize.setup}
        </h1>
        <div className="pn-celebration-state mx-auto mt-10 min-h-64 p-8">
          {revealed ? (
            <>
              <p className="text-xl font-bold uppercase text-slate-200">Actually...</p>
              <p className="mt-4 text-6xl font-black text-party-gold md:text-9xl">
                {prize.reveal}
              </p>
            </>
          ) : (
            <p className="pt-16 text-4xl font-black text-slate-200 md:text-7xl">
              TAP TO REVEAL
            </p>
          )}
        </div>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={revealPrize}
            className={primaryActionClassName}
          >
            Reveal Prize
          </button>
          <button
            type="button"
            onClick={choosePrize}
            className={secondaryActionClassName}
          >
            Next Prize
          </button>
          <Link href="/grand-prize" className={secondaryActionClassName}>
            Grand Prize
          </Link>
        </div>
      </section>
    </main>
  );
}
