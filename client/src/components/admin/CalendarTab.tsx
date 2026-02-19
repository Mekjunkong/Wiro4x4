import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/BookingCalendar";
import { TableSkeleton } from "./AdminSkeleton";

export function CalendarTab() {
  const utils = trpc.useUtils();

  const { data: bookings, isLoading: bookingsLoading } =
    trpc.booking.list.useQuery();

  const updateDateMut = trpc.booking.updateDate.useMutation({
    onSuccess: () => {
      utils.booking.list.invalidate();
      utils.booking.listPaginated.invalidate();
      toast.success("Booking rescheduled successfully!");
    },
    onError: () => toast.error("Failed to reschedule booking"),
  });

  function handleReschedule(
    bookingId: number,
    newArrival: string,
    newDeparture: string
  ) {
    if (
      !confirm(
        "Reschedule this booking to the new date? The trip duration will be preserved."
      )
    )
      return;
    updateDateMut.mutate({
      id: bookingId,
      arrivalDate: newArrival,
      departureDate: newDeparture,
    });
  }

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
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
}
