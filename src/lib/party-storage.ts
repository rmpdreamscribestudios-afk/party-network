"use client";

export type PartyGuest = {
  id: string;
  name: string;
  answer?: string;
  luckScore: number;
  createdAt: string;
};

export type Prize = {
  id: string;
  setup: string;
  reveal: string;
  isGrand?: boolean;
};

export type RaffleState = {
  winnerId?: string;
  prizeId?: string;
  prizeRevealed: boolean;
  grandPrizeRevealed: boolean;
  updatedAt?: string;
};

export const PARTY_RAFFLE_STATE_KEY = "party-network-raffle-state";
export const PARTY_GUESTS_KEY = "party-network-guests";
export const PARTY_EVENT_UPDATE = "party-network-state-updated";

export const defaultPrizes: Prize[] = [
  { id: "pc", setup: "Brand New PC", reveal: "Pancit Canton" },
  { id: "korea", setup: "Trip to Korea", reveal: "Chopsticks" },
  { id: "vehicle", setup: "Luxury Vehicle", reveal: "Toy Car" },
  { id: "iphone", setup: "iPhone", reveal: "Apple" },
  { id: "cash", setup: "Cash Prize", reveal: "Play Money" },
  {
    id: "grand-rice",
    setup: "Grand Prize: Pangkabuhayan Showcase",
    reveal: "8KG Rice",
    isGrand: true
  }
];

export const initialRaffleState: RaffleState = {
  prizeRevealed: false,
  grandPrizeRevealed: false
};

export function createGuest(name: string, answer?: string): PartyGuest {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
    answer: answer?.trim() || undefined,
    luckScore: Math.floor(Math.random() * 100) + 1,
    createdAt: new Date().toISOString()
  };
}

export function emitPartyUpdate() {
  window.dispatchEvent(new Event(PARTY_EVENT_UPDATE));
}

export function readLocalGuests(): PartyGuest[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawGuests = window.localStorage.getItem(PARTY_GUESTS_KEY);
    if (!rawGuests) {
      return [];
    }

    const parsedGuests = JSON.parse(rawGuests) as PartyGuest[];
    return parsedGuests
      .filter((guest) => guest.id && guest.name)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function readLocalGuestById(id: string): PartyGuest | undefined {
  return readLocalGuests().find((guest) => guest.id === id);
}

export function writeLocalGuests(guests: PartyGuest[]) {
  window.localStorage.setItem(PARTY_GUESTS_KEY, JSON.stringify(guests));
  emitPartyUpdate();
}

export function addLocalGuest(guest: PartyGuest): PartyGuest {
  writeLocalGuests([guest, ...readLocalGuests()]);
  return guest;
}

export function deleteLocalGuest(id: string) {
  writeLocalGuests(readLocalGuests().filter((guest) => guest.id !== id));
}

export function clearLocalGuests() {
  window.localStorage.removeItem(PARTY_GUESTS_KEY);
  emitPartyUpdate();
}

export function readRaffleState(): RaffleState {
  if (typeof window === "undefined") {
    return initialRaffleState;
  }

  try {
    const rawState = window.localStorage.getItem(PARTY_RAFFLE_STATE_KEY);
    if (!rawState) {
      return initialRaffleState;
    }

    const parsedState = JSON.parse(rawState) as Partial<RaffleState>;
    return {
      ...initialRaffleState,
      ...parsedState
    };
  } catch {
    return initialRaffleState;
  }
}

export function writeRaffleState(state: RaffleState) {
  window.localStorage.setItem(
    PARTY_RAFFLE_STATE_KEY,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() })
  );
  emitPartyUpdate();
}

export function resetPartyData() {
  window.localStorage.removeItem(PARTY_GUESTS_KEY);
  window.localStorage.removeItem(PARTY_RAFFLE_STATE_KEY);
  emitPartyUpdate();
}

export function getPrizeById(prizeId?: string): Prize {
  return (
    defaultPrizes.find((prize) => prize.id === prizeId) ??
    defaultPrizes.find((prize) => !prize.isGrand)!
  );
}

export function getLuckMessage(score: number): string {
  if (score >= 90) {
    return "Legendary energy. The raffle machine is sweating.";
  }

  if (score >= 70) {
    return "Golden aura confirmed. Stay close to the snack table.";
  }

  if (score >= 40) {
    return "Respectable luck. Suspiciously balanced, honestly.";
  }

  return "Chaotic luck unlocked. The Network enjoys plot twists.";
}
