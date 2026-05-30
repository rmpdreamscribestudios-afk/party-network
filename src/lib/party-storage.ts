"use client";

export type PartyGuest = {
  id: string;
  name: string;
  answer?: string;
  luckScore: number;
  createdAt: string;
};

export type Prize = {
  setup: string;
  reveal: string;
  isGrand?: boolean;
};

export const PARTY_GUESTS_KEY = "party-network-guests";
export const PARTY_CURRENT_GUEST_KEY = "party-network-current-guest-id";

export const defaultPrizes: Prize[] = [
  { setup: "Brand New PC", reveal: "Pancit Canton" },
  { setup: "Trip to Korea", reveal: "Chopsticks" },
  { setup: "Luxury Vehicle", reveal: "Toy Car" },
  { setup: "iPhone", reveal: "Apple" },
  { setup: "Cash Prize", reveal: "Play Money" },
  {
    setup: "Grand Prize: Pangkabuhayan Showcase",
    reveal: "8KG Rice",
    isGrand: true
  }
];

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

export function readGuests(): PartyGuest[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawGuests = window.localStorage.getItem(PARTY_GUESTS_KEY);
    if (!rawGuests) {
      return [];
    }

    const parsedGuests = JSON.parse(rawGuests);
    return Array.isArray(parsedGuests) ? parsedGuests : [];
  } catch {
    return [];
  }
}

export function writeGuests(guests: PartyGuest[]) {
  window.localStorage.setItem(PARTY_GUESTS_KEY, JSON.stringify(guests));
  window.dispatchEvent(new Event("party-network-guests-updated"));
}

export function addGuest(guest: PartyGuest) {
  const guests = readGuests();
  writeGuests([guest, ...guests]);
  window.localStorage.setItem(PARTY_CURRENT_GUEST_KEY, guest.id);
}

export function findCurrentGuest(): PartyGuest | undefined {
  const currentGuestId = window.localStorage.getItem(PARTY_CURRENT_GUEST_KEY);
  return readGuests().find((guest) => guest.id === currentGuestId);
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
