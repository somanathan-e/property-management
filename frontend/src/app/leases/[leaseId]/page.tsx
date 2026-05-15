import { LeaseDetailPage } from "@/modules/lease/lease-ui";

export default async function LeaseDetailRoute({
  params
}: Readonly<{
  params: Promise<{ leaseId: string }>;
}>) {
  const { leaseId } = await params;
  return <LeaseDetailPage leaseId={Number(leaseId)} />;
}
