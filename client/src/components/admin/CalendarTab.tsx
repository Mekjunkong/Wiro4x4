import { trpc } from '@/lib/trpc';
import { BookingCalendar } from '@/components/BookingCalendar';
import { PAGE_SIZE } from './types';

export function CalendarTab() {
  const { data: bookingsData, isLoading: bookingsLoading } = trpc.booking.listPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const bookings = bookingsData?.items;

  return (
    <div className="p-6">
      {bookingsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <BookingCalendar
          bookings={bookings?.map(b => ({
            id: b.id,
            contactName: b.contactName || '',
            contactEmail: b.contactEmail || '',
            contactPhone: b.contactPhone || '',
            arrivalDate: b.arrivalDate?.toString() || '',
            departureDate: b.departureDate?.toString() || '',
            numberOfAdults: b.numberOfAdults || 1,
            numberOfChildren: b.numberOfChildren || 0,
            status: b.status || 'pending',
            suggestedDestinations: b.suggestedDestinations || '',
            pickupPoint: b.pickupPoint || '',
            dropoffPoint: b.dropoffPoint || '',
          })) || []}
        />
      )}
    </div>
  );
}
