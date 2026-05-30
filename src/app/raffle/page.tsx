"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import {
  getPrizeById,
  PARTY_EVENT_UPDATE,
  PartyGuest,
  readRaffleState,
  writeRaffleState
} from "@/lib/party-storage";
import {
  fetchGuests,
  isSupabaseConfigured,
  subscribeToGuestChanges,
  supabaseNotConfiguredMessage
} from "@/lib/supabase-guests";

export default function RafflePage() {
  const [guests, setGuests] = useState<PartyGuest[]>([]);
  const [winner, setWinner] = useState<PartyGuest>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [prizeName, setPrizeName] = useState("Hidden");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const syncState = async () => {
      if (!isSupabaseConfigured) {
        setStatusMessage(supabaseNotConfiguredMessage);
        return;
      }

      try {
        const nextGuests = await fetchGuests();
        const nextState = readRaffleState();
        setGuests(nextGuests);
        setWinner(nextGuests.find((guest) => guest.id === nextState.winnerId));
        setPrizeName(
          nextState.grandPrizeRevealed
            ? "8KG Rice"
            : nextState.prizeRevealed
              ? getPrizeById(nextState.prizeId).reveal
              : "Hidden"
        );
        setStatusMessage("");
      } catch {
        setStatusMessage("Could not load guests from Supabase.");
      }
    };

    syncState();
    const channel = subscribeToGuestChanges(syncState);
    const pollingId = window.setInterval(syncState, 5000);
    window.addEventListener("storage", syncState);
    window.addEventListener(PARTY_EVENT_UPDATE, syncState);

    return () => {
      channel?.unsubscribe();
      window.clearInterval(pollingId);
      window.removeEventListener("storage", syncState);
      window.removeEventListener(PARTY_EVENT_UPDATE, syncState);
    };
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
      writeRaffleState({
        ...readRaffleState(),
        winnerId: nextWinner.id
      });
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
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
          <div className="rounded-md border border-gold/25 bg-black/45 p-4">
            <p className="text-xs uppercase text-stone-400">Entries</p>
            <p className="mt-1 text-3xl font-black text-gold">{guests.length}</p>
          </div>
          <div className="rounded-md border border-gold/25 bg-black/45 p-4">
            <p className="text-xs uppercase text-stone-400">Last Winner</p>
            <p className="mt-1 text-2xl font-black text-champagne">
              {winner?.name ?? "Pending"}
            </p>
          </div>
          <div className="rounded-md border border-gold/25 bg-black/45 p-4">
            <p className="text-xs uppercase text-stone-400">Prize</p>
            <p className="mt-1 text-2xl font-black text-champagne">
              {prizeName}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 flex min-h-72 max-w-3xl items-center justify-center rounded-md border border-gold/40 bg-black/55 p-6 shadow-gold backdrop-blur">
          {statusMessage ? (
            <p className="text-2xl font-bold text-champagne">{statusMessage}</p>
          ) : isDrawing ? (
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
