"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RevealPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/prize");
  }, [router]);

  return null;
}
