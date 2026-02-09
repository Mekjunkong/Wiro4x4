import { trpc } from "@/lib/trpc";
import { BookingCalendar } from "@/components/BookingCalendar";
import { PAGE_SIZE } from "./types";
import { TableSkeleton } from "./AdminSkeleton";

export function CalendarTab() {
  const { data: bookingsData, isLoading: bookingsLoading } =
    trpc.booking.listPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const bookings = bookingsData?.items;

  return (
    <div className="p-6">
      {bookingsLoading ? (
        <TableSkeleton />
      ) : (
        <BookingCalendar
          bookings={
            bookings?.map(b => ({
              id: b.id,
              contactName: b.contactName || "",
              contactEmail: b.contactEmail || "",
              contactPhone: b.contactPhone || "",
              arrivalDate: b.arrivalDate?.toString() || "",
              departureDate: b.departureDate?.toString() || "",
              numberOfAdults: b.numberOfAdults || 1,
              numberOfChildren: b.numberOfChildren || 0,
              status: b.status || "pending",
              suggestedDestinations: b.suggestedDestinations || "",
              pickupPoint: b.pickupPoint || "",
              dropoffPoint: b.dropoffPoint || "",
            })) || []
          }
        />
      )}
    </div>
  );
}
