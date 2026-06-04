import Image from "next/image";
import { partyNetworkBrand } from "@/lib/brand";

type LogoSize = "sm" | "md" | "lg";

const iconSizes: Record<LogoSize, number> = {
  sm: 32,
  md: 44,
  lg: 64
};

const wordmarkClasses: Record<LogoSize, string> = {
  sm: "h-7 max-w-36",
  md: "h-10 max-w-48",
  lg: "h-14 max-w-64"
};

type LogoProps = Readonly<{
  size?: LogoSize;
  className?: string;
}>;

export function LogoIcon({ size = "md", className = "" }: LogoProps) {
  const pixelSize = iconSizes[size];

  return (
    <Image
      src={partyNetworkBrand.assets.icon}
      alt={`${partyNetworkBrand.nameWithMark} icon`}
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

export function LogoWordmark({ size = "md", className = "" }: LogoProps) {
  return (
    <Image
      src={partyNetworkBrand.assets.wordmark}
      alt={partyNetworkBrand.nameWithMark}
      width={420}
      height={144}
      className={`object-contain ${wordmarkClasses[size]} ${className}`}
    />
  );
}

type LogoHeaderProps = LogoProps &
  Readonly<{
    showWordmark?: boolean;
  }>;

export function LogoHeader({
  size = "md",
  showWordmark = true,
  className = ""
}: LogoHeaderProps) {
  return (
    <div
      aria-label={partyNetworkBrand.nameWithMark}
      className={`inline-flex items-center gap-3 rounded-md bg-party-soft px-3 py-2 shadow-dashboard ${className}`}
    >
      <LogoIcon size={size} />
      {showWordmark ? <LogoWordmark size={size} /> : null}
    </div>
  );
}
