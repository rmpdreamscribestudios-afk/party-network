"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createGuest,
  getPrizeById,
  PARTY_EVENT_UPDATE,
  PartyGuest,
  readRaffleState,
  resetPartyData,
  RaffleState,
  writeRaffleState
} from "@/lib/party-storage";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/button-styles";
import { FormField } from "@/components/form-field";
import { clearHostAccess } from "@/lib/host-auth";
import {
  clearGuests,
  deleteGuest,
  fetchGuests,
  insertGuest,
  isSupabaseConfigured,
  subscribeToGuestChanges,
  supabaseNotConfiguredMessage
} from "@/lib/supabase-guests";

export default function HostPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<PartyGuest[]>([]);
  const [raffleState, setRaffleState] = useState<RaffleState>({
    prizeRevealed: false,
    grandPrizeRevealed: false
  });
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);

  const loadGuests = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatusMessage(supabaseNotConfiguredMessage);
      setGuests([]);
      return;
    }

    setIsLoadingGuests(true);
    setStatusMessage("");

    try {
      setGuests(await fetchGuests());
    } catch {
      setStatusMessage("Could not load guests from Supabase.");
    } finally {
      setIsLoadingGuests(false);
    }
  }, []);

  useEffect(() => {
    const syncRaffleState = () => {
      setRaffleState(readRaffleState());
    };

    syncRaffleState();
    loadGuests();

    const channel = subscribeToGuestChanges(loadGuests);
    const pollingId = window.setInterval(loadGuests, 5000);

    window.addEventListener("storage", syncRaffleState);
    window.addEventListener(PARTY_EVENT_UPDATE, syncRaffleState);

    return () => {
      channel?.unsubscribe();
      window.clearInterval(pollingId);
      window.removeEventListener("storage", syncRaffleState);
      window.removeEventListener(PARTY_EVENT_UPDATE, syncRaffleState);
    };
  }, [loadGuests]);

  const averageLuck = useMemo(() => {
    if (!guests.length) {
      return 0;
    }

    return Math.round(
      guests.reduce((total, guest) => total + guest.luckScore, 0) / guests.length
    );
  }, [guests]);

  async function handleAddGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    if (!name.trim()) {
      return;
    }

    if (!isSupabaseConfigured) {
      setStatusMessage(supabaseNotConfiguredMessage);
      return;
    }

    try {
      await insertGuest(createGuest(name, answer));
      setName("");
      setAnswer("");
      await loadGuests();
    } catch {
      setStatusMessage("Could not add guest to Supabase.");
    }
  }

  async function handleDeleteGuest(id: string) {
    setStatusMessage("");

    try {
      await deleteGuest(id);
      await loadGuests();
    } catch {
      setStatusMessage("Could not delete guest from Supabase.");
    }
  }

  async function handleClearGuests() {
    setStatusMessage("");

    try {
      await clearGuests();
      writeRaffleState({
        prizeRevealed: false,
        grandPrizeRevealed: false
      });
      await loadGuests();
    } catch {
      setStatusMessage("Could not clear guests from Supabase.");
    }
  }

  async function handleResetEvent() {
    resetPartyData();
    if (isSupabaseConfigured) {
      try {
        await clearGuests();
      } catch {
        setStatusMessage("Local event state was reset, but Supabase guests could not be cleared.");
      }
    }
    await loadGuests();
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
                onClick={handleClearGuests}
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
              <button
                type="button"
                className="rounded-md border border-gold/40 px-4 py-2 text-sm font-bold text-champagne transition hover:border-gold"
                onClick={loadGuests}
                disabled={isLoadingGuests}
              >
                {isLoadingGuests ? "Refreshing..." : "Refresh Guests"}
              </button>
            </div>
            {statusMessage ? (
              <p className="mt-4 rounded-md border border-gold/30 bg-black/50 p-3 text-sm font-semibold text-champagne">
                {statusMessage}
              </p>
            ) : null}
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
                      onClick={() => handleDeleteGuest(guest.id)}
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
