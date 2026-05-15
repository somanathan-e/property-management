import { resolveManagedConfig } from "@/modules/navigation/route-content";
import { EntityManager } from "@/modules/management/entity-manager";
import { OverviewPage } from "@/modules/navigation/overview-page";

export function SectionPage({
  title,
  subtitle,
  pathname
}: Readonly<{
  title: string;
  subtitle: string;
  pathname: string;
}>) {
  const config = resolveManagedConfig(pathname);

  if (config) {
    return <EntityManager config={config} />;
  }

  return <OverviewPage title={title} subtitle={subtitle} pathname={pathname} />;
}
