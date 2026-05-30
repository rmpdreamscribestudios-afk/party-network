import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Party Network",
  description: "Enter the Party Network experience."
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
