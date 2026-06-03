import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Party Network",
  description:
    "Party Network is a Shared Experiences Platform helping people connect, participate, and create meaningful memories together."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
