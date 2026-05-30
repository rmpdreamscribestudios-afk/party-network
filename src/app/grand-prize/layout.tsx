"use client";

import { HostRouteGuard } from "@/components/host-route-guard";

export default function GrandPrizeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HostRouteGuard>{children}</HostRouteGuard>;
}
