import type { ComponentPropsWithoutRef } from "react";

type FormFieldProps = Readonly<
  {
    label: string;
  } & ComponentPropsWithoutRef<"input">
>;

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-party-soft">{label}</span>
      <input
        {...inputProps}
        className="mt-2 min-h-12 w-full rounded-md border border-party-blue/35 bg-party-navy/70 px-4 text-base text-party-soft outline-none transition placeholder:text-slate-400 focus:border-party-teal focus:ring-2 focus:ring-party-teal/30"
      />
    </label>
  );
}
