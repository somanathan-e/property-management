import { Sidebar } from "@/components/sidebar";

export function AppShell({
  title,
  subtitle,
  children
}: Readonly<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Sidebar />
        <section className="rounded-[28px] bg-panel/90 p-6 shadow-card backdrop-blur md:p-8">
          <header className="border-b border-slate-200/80 pb-6">
            <p className="text-sm uppercase tracking-[0.22em] text-steel">Portfolio Control Center</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-steel">{subtitle}</p>
          </header>
          <div className="pt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
