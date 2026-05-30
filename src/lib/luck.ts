export type LuckTier = {
  minimumScore: number;
  message: string;
};

const luckTiers: LuckTier[] = [
  {
    minimumScore: 90,
    message: "Legendary entrance. The room just adjusted its posture."
  },
  {
    minimumScore: 70,
    message: "Golden energy detected. Tonight is leaning in your favor."
  },
  {
    minimumScore: 40,
    message: "Solid luck. Keep your confidence slightly suspicious."
  },
  {
    minimumScore: 1,
    message: "Chaotic charm unlocked. This could get interesting."
  }
];

export function generateLuckScore(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function getLuckMessage(score: number): string {
  return (
    luckTiers.find((tier) => score >= tier.minimumScore)?.message ??
    luckTiers.at(-1)!.message
  );
}
