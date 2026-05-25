/** Учётная запись только для демонстрации диплома / проверки (не для продакшн-секретов). */

export const DEMO_EMAIL_DEFAULT = "demo@masterforge.demo";
export const DEMO_PASSWORD_DEFAULT = "DemoForge2024!";

export function isDemoAccessEnabled(): boolean {
  const email = process.env.DEMO_EMAIL ?? process.env.NEXT_PUBLIC_DEMO_EMAIL ?? DEMO_EMAIL_DEFAULT;
  const password = process.env.DEMO_PASSWORD ?? process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? DEMO_PASSWORD_DEFAULT;
  return Boolean(email.trim() && password.trim());
}

export function getDemoCredentials(): { email: string; password: string } | null {
  if (!isDemoAccessEnabled()) return null;
  return {
    email: (process.env.DEMO_EMAIL ?? process.env.NEXT_PUBLIC_DEMO_EMAIL ?? DEMO_EMAIL_DEFAULT).trim(),
    password: (process.env.DEMO_PASSWORD ?? process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? DEMO_PASSWORD_DEFAULT).trim(),
  };
}

/** Публичный URL демо-входа (для диплома и нейросетей с браузером). */
export function getDemoEntryPath(): string {
  return "/demo";
}
