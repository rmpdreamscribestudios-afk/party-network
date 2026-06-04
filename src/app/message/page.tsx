import Link from "next/link";
import { secondaryActionClassName } from "@/components/button-styles";

export default function HostMessagePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <section className="w-full max-w-5xl text-center">
        <p className="text-lg font-bold uppercase text-party-teal">From the Host</p>
        <h1 className="mt-4 text-4xl font-black text-party-soft md:text-7xl">
          Tonight Was Never Just About Prizes
        </h1>
        <p className="pn-celebration-state mt-8 p-6 text-left text-xl leading-9 text-slate-100 md:p-10 md:text-3xl md:leading-[1.45]">
          Tonight, we laughed, played, and created memories together. In a world
          full of stress, pressure, negativity, and rising prices, we wanted
          this experience to remind everyone that joy is still possible. This
          prize may look simple, but today, even 8 kilograms of rice can feel
          like a luxury. Tonight was never just about prizes. It was about
          laughter, love, and giving everyone a moment to forget the heaviness
          outside.
        </p>
        <Link href="/host" className={`mx-auto mt-8 max-w-sm ${secondaryActionClassName}`}>
          Back to Host
        </Link>
      </section>
    </main>
  );
}
