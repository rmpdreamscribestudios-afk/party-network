"use client";

import { HostRouteGuard } from "@/components/host-route-guard";

export default function LiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HostRouteGuard>{children}</HostRouteGuard>;
}
