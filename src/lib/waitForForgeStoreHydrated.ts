import { useForgeStore } from "@/store/useForgeStore";

const HYDRATE_WAIT_MS = 3000;

/** Дождаться zustand/persist — иначе cloud sync читает пустой стор и затирает localStorage. */
export function waitForForgeStoreHydrated(): Promise<void> {
  const p = useForgeStore.persist;
  // На сервере / при пререндере Next.js у стора может не быть persist API — не ждём.
  if (!p?.hasHydrated) {
    return Promise.resolve();
  }
  if (p.hasHydrated()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const unsub = p.onFinishHydration(() => {
      unsub();
      finish();
    });
    window.setTimeout(() => {
      unsub();
      finish();
    }, HYDRATE_WAIT_MS);
  });
}
