"use client";

import { HostRouteGuard } from "@/components/host-route-guard";

export default function PrizeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HostRouteGuard>{children}</HostRouteGuard>;
}
