"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { LogoHeader } from "@/components/logo";
import {
  getPrizeById,
  PARTY_EVENT_UPDATE,
  readRaffleState,
  writeRaffleState
} from "@/lib/party-storage";
import type { PartyGuest } from "@/lib/party-storage";
import {
  fetchGuests,
  subscribeToGuestChanges
} from "@/lib/supabase-guests";
import { useEventSettings } from "@/lib/use-event-settings";

export default function RafflePage() {
  const { settings } = useEventSettings();
  const [guests, setGuests] = useState<PartyGuest[]>([]);
  const [winner, setWinner] = useState<PartyGuest>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [prizeName, setPrizeName] = useState("Hidden");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const syncState = async () => {
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
        setStatusMessage("Could not load guests.");
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
        <LogoHeader size="md" className="mx-auto mb-6" />
        <p className="text-lg font-bold uppercase text-party-teal">Live Draw</p>
        <p className="mt-2 text-2xl font-bold text-party-soft">{settings.title}</p>
        <h1 className="mt-3 text-5xl font-black text-party-soft sm:text-7xl md:text-8xl">
          THE NETWORK HAS CHOSEN
        </h1>
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
          <div className="pn-stat-card p-4">
            <p className="text-xs font-bold uppercase text-slate-300">Entries</p>
            <p className="mt-1 text-3xl font-black text-party-teal">{guests.length}</p>
          </div>
          <div className="pn-stat-card p-4">
            <p className="text-xs font-bold uppercase text-slate-300">Last Winner</p>
            <p className="mt-1 text-2xl font-black text-party-soft">
              {winner?.name ?? "Pending"}
            </p>
          </div>
          <div className="pn-stat-card p-4">
            <p className="text-xs font-bold uppercase text-slate-300">Prize</p>
            <p className="mt-1 text-2xl font-black text-party-soft">
              {prizeName}
            </p>
          </div>
        </div>

        <div className="pn-celebration-state mx-auto mt-10 flex min-h-72 max-w-3xl items-center justify-center p-6">
          {statusMessage ? (
            <p className="text-2xl font-bold text-party-soft">{statusMessage}</p>
          ) : isDrawing ? (
            <p className="winner-flicker text-5xl font-black text-party-gold md:text-8xl">
              SCANNING...
            </p>
          ) : winner ? (
            <div>
              <p className="text-xl font-bold uppercase text-slate-200">Winner</p>
              <p className="mt-3 text-6xl font-black text-party-gold md:text-9xl">
                {winner.name}
              </p>
              <p className="mt-5 text-2xl text-party-soft">
                Luck Score: {winner.luckScore}
              </p>
            </div>
          ) : (
            <p className="text-3xl font-bold text-slate-200">
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
