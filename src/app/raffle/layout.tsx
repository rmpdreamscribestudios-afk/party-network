"use client";

import { HostRouteGuard } from "@/components/host-route-guard";

export default function RaffleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HostRouteGuard>{children}</HostRouteGuard>;
}
