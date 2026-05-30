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
        className={`relative z-10 w-full max-w-md ${
          isCentered ? "text-center" : "text-left"
        }`}
      >
        {eyebrow ? (
          <p className="mb-4 text-sm font-semibold uppercase tracking-normal text-gold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold tracking-normal text-champagne sm:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 text-lg leading-8 text-stone-300">{subtitle}</p>
        ) : null}
        <div className="mt-9">{children}</div>
      </section>
    </main>
  );
}
