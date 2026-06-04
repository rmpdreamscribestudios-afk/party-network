type ExperienceShellProps = Readonly<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  children: React.ReactNode;
}>;

export function ExperienceShell({
  eyebrow,
  title,
  subtitle,
  align = "center",
  children
}: ExperienceShellProps) {
  const isCentered = align === "center";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-6">
      <div className="premium-orbit opacity-60" />
      <section
        className={`pn-guest-card relative z-10 w-full max-w-md ${
          isCentered ? "text-center" : "text-left"
        }`}
      >
        {eyebrow ? (
          <p className="mb-4 text-sm font-bold uppercase tracking-normal text-party-teal">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-black tracking-normal text-party-soft sm:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 text-lg leading-8 text-slate-200">{subtitle}</p>
        ) : null}
        <div className="mt-9">{children}</div>
      </section>
    </main>
  );
}
