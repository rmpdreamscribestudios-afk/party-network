"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasHostAccess, HOST_LOGIN_PATH } from "@/lib/host-auth";

type HostRouteGuardProps = Readonly<{
  children: React.ReactNode;
}>;

export function HostRouteGuard({ children }: HostRouteGuardProps) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // MVP-only client guard. Production should use Supabase Auth or another
    // server-side authentication layer so protected routes are enforced before render.
    if (!hasHostAccess()) {
      router.replace(HOST_LOGIN_PATH);
      return;
    }

    setIsAllowed(true);
  }, [router]);

  if (!isAllowed) {
    return null;
  }

  return children;
}
