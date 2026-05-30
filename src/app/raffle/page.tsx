"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { PartyGuest, readGuests } from "@/lib/party-storage";

export default function RafflePage() {
  const [guests, setGuests] = useState<PartyGuest[]>([]);
  const [winner, setWinner] = useState<PartyGuest>();
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setGuests(readGuests());
  }, []);

  function startDraw() {
    if (!guests.length || isDrawing) {
      return;
    }

    setWinner(undefined);
    setIsDrawing(true);

    window.setTimeout(() => {
      const nextWinner = guests[Math.floor(Math.random() * guests.length)];
      setWinner(nextWinner);
      setIsDrawing(false);
    }, 2200);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 text-center">
      <div className="premium-orbit" />
      <section className="relative z-10 w-full max-w-5xl">
        <p className="text-lg font-bold uppercase text-gold">Raffle Draw</p>
        <h1 className="mt-3 text-5xl font-black text-champagne sm:text-7xl md:text-8xl">
          THE NETWORK HAS CHOSEN
        </h1>

        <div className="mx-auto mt-10 flex min-h-72 max-w-3xl items-center justify-center rounded-md border border-gold/40 bg-black/55 p-6 shadow-gold backdrop-blur">
          {isDrawing ? (
            <p className="winner-flicker text-5xl font-black text-gold md:text-8xl">
              SCANNING...
            </p>
          ) : winner ? (
            <div>
              <p className="text-xl uppercase text-stone-300">Winner</p>
              <p className="mt-3 text-6xl font-black text-gold md:text-9xl">
                {winner.name}
              </p>
              <p className="mt-5 text-2xl text-champagne">
                Luck Score: {winner.luckScore}
              </p>
            </div>
          ) : (
            <p className="text-3xl font-bold text-stone-300">
              {guests.length
                ? `${guests.length} guests are in the draw.`
                : "Add guests from the host dashboard first."}
            </p>
          )}
        </div>

        <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={startDraw}
            disabled={!guests.length || isDrawing}
            className={primaryActionClassName}
          >
            Start Draw
          </button>
          <Link href="/prize" className={secondaryActionClassName}>
            Reveal Prize
          </Link>
        </div>
      </section>
    </main>
  );
}
