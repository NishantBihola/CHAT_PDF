"use client";
import { useEffect, useState } from "react";
export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const res = await fetch("/api/subscription/me");
        if (res.ok) { const json = await res.json(); if (mounted) setPlan(json.plan ?? "free"); }
      } finally { if (mounted) setLoading(false); }
    })(); return () => { mounted = false; };
  }, []);
  return { plan, loading };
}
