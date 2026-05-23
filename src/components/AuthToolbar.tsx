"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearForgeLocalCampaignData } from "@/lib/forgeLocalAuth";
import { createClient } from "@/lib/supabase/client";

export function AuthToolbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [sessionKnown, setSessionKnown] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setEmail(data.session?.user?.email ?? null);
      setSessionKnown(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setSessionKnown(true);
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
      clearForgeLocalCampaignData();
      setEmail(null);
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!sessionKnown) {
    return (
      <span className="forge-nav-btn shrink-0 opacity-40" aria-hidden>
        …
      </span>
    );
  }

  if (!email) {
    return (
      <Link href="/login" className="forge-nav-btn shrink-0" title="Вход или регистрация">
        Вход
      </Link>
    );
  }

  return (
    <span className="flex max-w-[min(12rem,40vw)] shrink-0 items-center gap-2 sm:max-w-[min(12rem,28vw)]">
      <span className="forge-muted hidden max-w-[8rem] truncate text-[10px] min-[520px]:inline" title={email}>
        {email}
      </span>
      <button type="button" className="forge-nav-btn shrink-0 disabled:opacity-50" disabled={busy} onClick={() => void signOut()}>
        Выход
      </button>
    </span>
  );
}
