"use client";

import { createContext, useContext, type ReactNode } from "react";

type ForgeBootState = {
  /** localStorage (zustand persist) готов — достаточно, чтобы показывать кампании. */
  persistReady: boolean;
  /** Облачная синхронизация завершила первый проход (информативно, UI не блокируем). */
  cloudReady: boolean;
};

const ForgeBootContext = createContext<ForgeBootState>({
  persistReady: false,
  cloudReady: false,
});

/** Ждём только rehydrate localStorage; облако подтягивается в фоне. */
export function useForgeBootReady(): boolean {
  const { persistReady } = useContext(ForgeBootContext);
  return persistReady;
}

export function useForgeCloudReady(): boolean {
  return useContext(ForgeBootContext).cloudReady;
}

export function ForgeBootProvider({
  persistReady,
  cloudReady,
  children,
}: ForgeBootState & { children: ReactNode }) {
  return <ForgeBootContext.Provider value={{ persistReady, cloudReady }}>{children}</ForgeBootContext.Provider>;
}

/** Экран «подождите» пока стор не готов после F5. */
export function ForgeBootLoading({ title = "Загрузка…" }: { title?: string }) {
  return (
    <p className="forge-muted px-1 py-8 text-sm" aria-live="polite">
      {title}
    </p>
  );
}
