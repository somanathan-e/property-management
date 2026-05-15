import { notFound } from "next/navigation";
import { SectionPage } from "@/modules/navigation/section-page";
import { findNavigationItem } from "@/modules/navigation/route-content";

export default async function DashboardSubpage({
  params
}: Readonly<{
  params: Promise<{ page: string }>;
}>) {
  const { page } = await params;
  const item = findNavigationItem(`/dashboard/${page}`);

  if (!item) {
    notFound();
  }

  return <SectionPage title={item.label} subtitle={item.description} pathname={item.href} />;
}
