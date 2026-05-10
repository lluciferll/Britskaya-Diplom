"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthToolbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setEmail(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!email) {
    return (
      <Link href="/login" className="forge-nav-btn shrink-0" title="Вход или регистрация">
        Вход
      </Link>
    );
  }

  return (
    <span className="flex max-w-[min(12rem,28vw)] shrink-0 items-center gap-2">
      <span className="forge-muted truncate text-[10px]" title={email}>
        {email}
      </span>
      <button type="button" className="forge-nav-btn shrink-0 disabled:opacity-50" disabled={busy} onClick={() => void signOut()}>
        Выход
      </button>
    </span>
  );
}
