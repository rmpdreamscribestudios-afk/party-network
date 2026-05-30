import type { ComponentPropsWithoutRef } from "react";

type FormFieldProps = Readonly<
  {
    label: string;
  } & ComponentPropsWithoutRef<"input">
>;

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-200">{label}</span>
      <input
        {...inputProps}
        className="mt-2 min-h-12 w-full rounded-md border border-stone-700 bg-charcoal px-4 text-base text-champagne outline-none transition placeholder:text-stone-500 focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
    </label>
  );
}
