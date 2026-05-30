"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPrizeById,
  PARTY_EVENT_UPDATE,
  readRaffleState
} from "@/lib/party-storage";
import type { PartyGuest } from "@/lib/party-storage";
import {
  fetchGuests,
  subscribeToGuestChanges
} from "@/lib/supabase-guests";
import { useEventSettings } from "@/lib/use-event-settings";

export default function LivePage() {
  const { settings } = useEventSettings();
  const [guests, setGuests] = useState<PartyGuest[]>([]);
  const [winnerName, setWinnerName] = useState("Pending");
  const [prizeName, setPrizeName] = useState("Awaiting reveal");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const syncGuests = async () => {
      try {
        const nextGuests = await fetchGuests();
        const state = readRaffleState();
        setGuests(nextGuests);
        setWinnerName(
          nextGuests.find((guest) => guest.id === state.winnerId)?.name ?? "Pending"
        );
        setPrizeName(
          state.grandPrizeRevealed
            ? "8KG Rice"
            : state.prizeRevealed
              ? getPrizeById(state.prizeId).reveal
              : "Awaiting reveal"
        );
        setStatusMessage("");
      } catch {
        setStatusMessage("Could not load guests.");
      }
    };

    syncGuests();
    const channel = subscribeToGuestChanges(syncGuests);
    const pollingId = window.setInterval(syncGuests, 5000);
    window.addEventListener("storage", syncGuests);
    window.addEventListener(PARTY_EVENT_UPDATE, syncGuests);

    return () => {
      channel?.unsubscribe();
      window.clearInterval(pollingId);
      window.removeEventListener("storage", syncGuests);
      window.removeEventListener(PARTY_EVENT_UPDATE, syncGuests);
    };
  }, []);

  const displayGuests = statusMessage
    ? []
    : guests.length
    ? guests
    : [{ id: "empty", name: "Join the Network", luckScore: 100, createdAt: "" }];

  return (
    <main className="relative flex min-h-screen overflow-hidden px-6 py-8">
      <div className="premium-orbit" />
      <section className="relative z-10 flex w-full flex-col justify-between">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xl font-bold uppercase text-gold">Live Party Feed</p>
            <h1 className="mt-2 text-6xl font-black text-champagne md:text-8xl">
              {settings.title}
            </h1>
            {settings.subtitle ? (
              <p className="mt-3 max-w-3xl text-2xl text-stone-300">
                {settings.subtitle}
              </p>
            ) : null}
          </div>
          <Link
            href="/host"
            className="rounded-md border border-gold/40 px-5 py-3 text-lg font-bold text-champagne"
          >
            Host
          </Link>
        </header>

        <div className="relative my-10 min-h-[44vh]">
          {statusMessage ? (
            <p className="rounded-md border border-gold/30 bg-black/55 p-8 text-center text-3xl font-bold text-champagne">
              {statusMessage}
            </p>
          ) : null}
          {displayGuests.slice(0, 18).map((guest, index) => (
            <span
              key={`${guest.id}-${index}`}
              className="floating-name absolute rounded-md border border-gold/30 bg-black/40 px-5 py-3 text-2xl font-black text-champagne shadow-gold backdrop-blur md:text-5xl"
              style={{
                top: `${(index * 17) % 78}%`,
                left: `${(index * 23) % 70}%`,
                animationDelay: `${index * -1.3}s`
              }}
            >
              {guest.name}
            </span>
          ))}
        </div>

        <footer className="grid gap-4 border-t border-gold/20 pt-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-3xl font-black text-gold md:text-6xl">
                {guests.length.toString().padStart(2, "0")}
              </p>
              <p className="text-xl text-stone-300">Guests connected</p>
            </div>
            <div>
              <p className="break-words text-3xl font-black text-gold md:text-5xl">
                {winnerName}
              </p>
              <p className="text-xl text-stone-300">Current winner</p>
            </div>
            <div>
              <p className="break-words text-3xl font-black text-gold md:text-5xl">
                {prizeName}
              </p>
              <p className="text-xl text-stone-300">Prize board</p>
            </div>
          </div>
          <p className="countdown-pulse text-4xl font-black text-champagne md:text-7xl">
            DRAW SOON
          </p>
        </footer>
      </section>
    </main>
  );
}
