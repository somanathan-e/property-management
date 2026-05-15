import { ReservationDetailPage } from "@/modules/reservation/reservation-ui";

export default async function ReservationDetailRoute({
  params
}: Readonly<{
  params: Promise<{ reservationId: string }>;
}>) {
  const { reservationId } = await params;
  return <ReservationDetailPage reservationId={Number(reservationId)} />;
}
