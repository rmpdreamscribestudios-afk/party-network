import type { Metadata } from "next";
import { partyNetworkBrand } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: partyNetworkBrand.nameWithMark,
    template: `%s | ${partyNetworkBrand.nameWithMark}`
  },
  description: partyNetworkBrand.description,
  applicationName: partyNetworkBrand.nameWithMark,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      {
        url: "/brand/party-network-icon-16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        url: "/brand/party-network-icon-32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: "/brand/party-network-icon-48.png",
        sizes: "48x48",
        type: "image/png"
      },
      {
        url: "/brand/party-network-icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  openGraph: {
    title: partyNetworkBrand.nameWithMark,
    description: partyNetworkBrand.description,
    siteName: partyNetworkBrand.nameWithMark,
    images: [
      {
        url: partyNetworkBrand.assets.ogImage,
        width: 1200,
        height: 630,
        alt: partyNetworkBrand.nameWithMark
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: partyNetworkBrand.nameWithMark,
    description: partyNetworkBrand.description,
    images: [partyNetworkBrand.assets.ogImage]
  }
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
