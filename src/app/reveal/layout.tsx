"use client";

import { HostRouteGuard } from "@/components/host-route-guard";

export default function RevealLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <HostRouteGuard>{children}</HostRouteGuard>;
}
