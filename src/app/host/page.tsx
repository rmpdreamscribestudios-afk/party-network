"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createGuest,
  getPrizeById,
  PARTY_EVENT_UPDATE,
  PartyGuest,
  readGuests,
  readRaffleState,
  resetPartyData,
  RaffleState,
  writeGuests,
  writeRaffleState
} from "@/lib/party-storage";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { FormField } from "@/components/form-field";
import { clearHostAccess } from "@/lib/host-auth";

export default function HostPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<PartyGuest[]>([]);
  const [raffleState, setRaffleState] = useState<RaffleState>({
    prizeRevealed: false,
    grandPrizeRevealed: false
  });
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const syncState = () => {
      setGuests(readGuests());
      setRaffleState(readRaffleState());
    };

    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener(PARTY_EVENT_UPDATE, syncState);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(PARTY_EVENT_UPDATE, syncState);
    };
  }, []);

  const averageLuck = useMemo(() => {
    if (!guests.length) {
      return 0;
    }

    return Math.round(
      guests.reduce((total, guest) => total + guest.luckScore, 0) / guests.length
    );
  }, [guests]);

  function updateGuests(nextGuests: PartyGuest[]) {
    setGuests(nextGuests);
    writeGuests(nextGuests);
  }

  function handleAddGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    updateGuests([createGuest(name, answer), ...guests]);
    setName("");
    setAnswer("");
  }

  function handleResetEvent() {
    resetPartyData();
    setGuests([]);
    setRaffleState({ prizeRevealed: false, grandPrizeRevealed: false });
  }

  function handleLogout() {
    clearHostAccess();
    router.replace("/host-login");
  }

  const currentWinner = guests.find((guest) => guest.id === raffleState.winnerId);
  const currentPrize = getPrizeById(raffleState.prizeId);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-gold/20 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-gold">
              Host Control
            </p>
            <h1 className="mt-2 text-4xl font-black text-champagne sm:text-6xl">
              Party Network
            </h1>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link href="/live" className={secondaryActionClassName}>
              Live Display
            </Link>
            <Link href="/raffle" className={primaryActionClassName}>
              Raffle
            </Link>
            <Link href="/prize" className={secondaryActionClassName}>
              Prize Reveal
            </Link>
            <button
              type="button"
              className={secondaryActionClassName}
              onClick={handleLogout}
            >
              Logout Host
            </button>
          </nav>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-md border border-gold/30 bg-black/45 p-5">
            <p className="text-sm uppercase text-stone-400">Guests</p>
            <p className="mt-2 text-5xl font-black text-gold">{guests.length}</p>
          </div>
          <div className="rounded-md border border-gold/30 bg-black/45 p-5">
            <p className="text-sm uppercase text-stone-400">Average Luck</p>
            <p className="mt-2 text-5xl font-black text-gold">{averageLuck}</p>
          </div>
          <div className="rounded-md border border-gold/30 bg-black/45 p-5">
            <p className="text-sm uppercase text-stone-400">Winner</p>
            <p className="mt-2 text-3xl font-black text-gold">
              {currentWinner?.name ?? "Pending"}
            </p>
          </div>
          <div className="rounded-md border border-gold/30 bg-black/45 p-5">
            <p className="text-sm uppercase text-stone-400">Prize Status</p>
            <p className="mt-2 text-3xl font-black text-gold">
              {raffleState.grandPrizeRevealed
                ? "8KG Rice"
                : raffleState.prizeRevealed
                  ? currentPrize.reveal
                  : "Hidden"}
            </p>
          </div>
          <form
            onSubmit={handleAddGuest}
            className="rounded-md border border-gold/30 bg-black/45 p-5 md:col-span-1 md:row-span-2"
          >
            <h2 className="text-2xl font-bold text-champagne">Add Guest</h2>
            <div className="mt-5 space-y-4">
              <FormField
                required
                label="Guest Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Manual guest"
              />
              <FormField
                label="Funny Answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Optional"
              />
              <button type="submit" className={primaryActionClassName}>
                Add Guest
              </button>
              <button
                type="button"
                className={secondaryActionClassName}
                onClick={() => {
                  updateGuests([]);
                  writeRaffleState({
                    prizeRevealed: false,
                    grandPrizeRevealed: false
                  });
                }}
                disabled={!guests.length}
              >
                Clear Guest List
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-red-400/50 px-6 py-3 text-center text-base font-bold text-red-100 transition hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 focus:ring-offset-obsidian"
                onClick={handleResetEvent}
              >
                Reset Event
              </button>
            </div>
          </form>

          <div className="rounded-md border border-gold/30 bg-black/45 p-5 md:col-span-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-champagne">
                Registered Guests
              </h2>
              <span className="text-sm text-stone-400">localStorage MVP</span>
            </div>
            <div className="mt-5 max-h-[56vh] space-y-3 overflow-auto pr-1">
              {guests.length ? (
                guests.map((guest) => (
                  <article
                    key={guest.id}
                    className="grid gap-3 rounded-md border border-stone-800 bg-stone-950/70 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-champagne">
                        {guest.name}
                      </h3>
                      {guest.answer ? (
                        <p className="mt-1 text-sm text-stone-400">
                          {guest.answer}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-3xl font-black text-gold">
                      {guest.luckScore}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        updateGuests(guests.filter((item) => item.id !== guest.id))
                      }
                      className="min-h-11 rounded-md border border-red-400/40 px-4 font-bold text-red-100 transition hover:bg-red-500/15"
                    >
                      Delete
                    </button>
                  </article>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-gold/30 p-8 text-center text-stone-300">
                  No guests yet. The Network awaits names.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
