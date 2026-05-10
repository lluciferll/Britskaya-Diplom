import Link from "next/link";

type Props = { searchParams: Promise<{ reason?: string }> };

export default async function AuthCodeErrorPage({ searchParams }: Props) {
  const sp = await searchParams;
  const reason = sp.reason;

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-lg font-semibold">Не удалось завершить вход</h1>
      <p className="text-sm text-[var(--tt-muted)]">
        Ссылка подтверждения устарела или уже использована. Запросите вход снова.
      </p>
      {reason ? (
        <pre className="forge-inset overflow-x-auto p-3 text-[11px] text-[var(--tt-muted)]">{reason}</pre>
      ) : null}
      <Link href="/" className="forge-btn-outline w-fit text-sm">
        На главную
      </Link>
    </div>
  );
}
