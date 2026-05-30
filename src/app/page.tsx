import Link from "next/link";
import { primaryActionClassName } from "@/components/button-styles";
import { ExperienceShell } from "@/components/experience-shell";

export default function LandingPage() {
  return (
    <ExperienceShell
      eyebrow="Private Event"
      title="Party Network"
      subtitle="Enter the Experience"
    >
      <Link href="/join" className={primaryActionClassName}>
        Join Event
      </Link>
    </ExperienceShell>
  );
}
