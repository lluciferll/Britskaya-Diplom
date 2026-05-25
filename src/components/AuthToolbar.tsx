"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearForgeLocalCampaignData } from "@/lib/forgeLocalAuth";
import { PREVIEW_ENTER_PATH, PREVIEW_EXIT_PATH, isPreviewModeClient } from "@/lib/previewMode";
import { createClient } from "@/lib/supabase/client";

export function AuthToolbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [sessionKnown, setSessionKnown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setPreview(isPreviewModeClient());
  }, []);

  useEffect(() => {
    if (preview) return;
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
  }, [preview]);

  if (preview) {
    return (
      <span className="flex shrink-0 items-center gap-2">
        <span className="forge-nav-btn shrink-0 cursor-default opacity-90" title="Без Supabase">
          Предпросмотр
        </span>
        <Link href={PREVIEW_EXIT_PATH} className="forge-nav-btn shrink-0">
          Выйти
        </Link>
        <Link href="/login" className="forge-nav-btn shrink-0">
          Вход
        </Link>
      </span>
    );
  }

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
      <span className="flex shrink-0 items-center gap-2">
        <Link href={PREVIEW_ENTER_PATH} className="forge-nav-btn shrink-0" title="Весь интерфейс без регистрации">
          Предпросмотр
        </Link>
        <Link href="/login" className="forge-nav-btn shrink-0" title="Вход или регистрация">
          Вход
        </Link>
      </span>
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
