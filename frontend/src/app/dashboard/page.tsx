import { AppShell } from "@/layouts/app-shell";
import { ExecutiveDashboard } from "@/modules/dashboard/executive-dashboard";

export default function DashboardPage() {
  return (
    <AppShell title="Executive Dashboard" subtitle="Portfolio health across property, lease, customer, and revenue operations.">
      <ExecutiveDashboard />
    </AppShell>
  );
}
