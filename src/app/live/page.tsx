"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PartyGuest, readGuests } from "@/lib/party-storage";

export default function LivePage() {
  const [guests, setGuests] = useState<PartyGuest[]>([]);

  useEffect(() => {
    const syncGuests = () => setGuests(readGuests());

    syncGuests();
    window.addEventListener("storage", syncGuests);
    window.addEventListener("party-network-guests-updated", syncGuests);

    return () => {
      window.removeEventListener("storage", syncGuests);
      window.removeEventListener("party-network-guests-updated", syncGuests);
    };
  }, []);

  const displayGuests = guests.length ? guests : [{ id: "empty", name: "Join the Network", luckScore: 100, createdAt: "" }];

  return (
    <main className="relative flex min-h-screen overflow-hidden px-6 py-8">
      <div className="premium-orbit" />
      <section className="relative z-10 flex w-full flex-col justify-between">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xl font-bold uppercase text-gold">Live Party Feed</p>
            <h1 className="mt-2 text-6xl font-black text-champagne md:text-8xl">
              Party Network
            </h1>
          </div>
          <Link
            href="/host"
            className="rounded-md border border-gold/40 px-5 py-3 text-lg font-bold text-champagne"
          >
            Host
          </Link>
        </header>

        <div className="relative my-10 min-h-[44vh]">
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
          <div>
            <p className="text-3xl font-black text-gold md:text-6xl">
              {guests.length.toString().padStart(2, "0")}
            </p>
            <p className="text-xl text-stone-300">Guests connected</p>
          </div>
          <p className="countdown-pulse text-4xl font-black text-champagne md:text-7xl">
            DRAW SOON
          </p>
        </footer>
      </section>
    </main>
  );
}
