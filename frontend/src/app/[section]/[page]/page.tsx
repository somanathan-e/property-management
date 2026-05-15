import { notFound } from "next/navigation";
import { SectionPage } from "@/modules/navigation/section-page";
import { findNavigationItem } from "@/modules/navigation/route-content";

export default async function ModulePage({
  params
}: Readonly<{
  params: Promise<{ section: string; page: string }>;
}>) {
  const { section, page } = await params;
  const item = findNavigationItem(`/${section}/${page}`);

  if (!item) {
    notFound();
  }

  return <SectionPage title={item.label} subtitle={item.description} pathname={item.href} />;
}
