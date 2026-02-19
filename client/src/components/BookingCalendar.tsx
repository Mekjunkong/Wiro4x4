import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  id: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  arrivalDate: string;
  departureDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  status: string;
  suggestedDestinations?: string;
  pickupPoint: string;
  dropoffPoint: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
  onReschedule?: (
    bookingId: number,
    newArrival: string,
    newDeparture: string
  ) => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  in_progress: "bg-blue-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function BookingCalendar({
  bookings,
  onBookingClick,
  onReschedule,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter(booking => {
      const arrival = new Date(booking.arrivalDate).toISOString().split("T")[0];
      const departure = new Date(booking.departureDate)
        .toISOString()
        .split("T")[0];
      return dateStr >= arrival && dateStr <= departure;
    });
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: {
      date: Date;
      isCurrentMonth: boolean;
      bookings: Booking[];
    }[] = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        bookings: getBookingsForDate(date),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        bookings: getBookingsForDate(date),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        bookings: getBookingsForDate(date),
      });
    }

    return days;
  }, [year, month, bookings]);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
    if (onBookingClick) {
      onBookingClick(booking);
    }
  };

  // Drag-drop handlers
  function handleDragStart(e: React.DragEvent, booking: Booking) {
    e.dataTransfer.setData("bookingId", String(booking.id));
    e.dataTransfer.setData("arrivalDate", booking.arrivalDate);
    e.dataTransfer.setData("departureDate", booking.departureDate);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, dateStr: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateStr);
  }

  function handleDragLeave() {
    setDragOverDate(null);
  }

  function handleDrop(e: React.DragEvent, targetDateStr: string) {
    e.preventDefault();
    setDragOverDate(null);
    if (!onReschedule) return;

    const bookingId = Number(e.dataTransfer.getData("bookingId"));
    const oldArrival = new Date(e.dataTransfer.getData("arrivalDate"));
    const oldDeparture = new Date(e.dataTransfer.getData("departureDate"));
    const newArrival = new Date(targetDateStr);

    const diffMs = newArrival.getTime() - oldArrival.getTime();
    const newDeparture = new Date(oldDeparture.getTime() + diffMs);

    onReschedule(
      bookingId,
      newArrival.toISOString(),
      newDeparture.toISOString()
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Booking Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-semibold">
              {MONTHS[month]} {year}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
          {onReschedule && (
            <div className="text-xs text-muted-foreground ml-4 flex items-center gap-1">
              <span className="font-medium">Tip:</span> Drag bookings to
              reschedule
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(
            ({ date, isCurrentMonth, bookings: dayBookings }, index) => {
              const dateStr = date.toISOString().split("T")[0];
              const isDragTarget = dragOverDate === dateStr;
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-1 border rounded-lg transition-colors
                    ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                    ${isToday(date) ? "border-primary border-2" : "border-border"}
                    ${isDragTarget ? "ring-2 ring-primary/50 bg-primary/5" : ""}
                  `}
                  onDragOver={e => handleDragOver(e, dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, dateStr)}
                >
                  <div
                    className={`
                    text-sm font-medium mb-1 px-1
                    ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                    ${isToday(date) ? "text-primary" : ""}
                  `}
                  >
                    {date.getDate()}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[70px]">
                    {dayBookings.slice(0, 3).map(booking => (
                      <button
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        draggable={!!onReschedule}
                        onDragStart={e => handleDragStart(e, booking)}
                        className={`
                          w-full text-left text-xs p-1 rounded truncate
                          text-white hover:opacity-80 transition-opacity
                          ${STATUS_COLORS[booking.status] || "bg-gray-500"}
                          ${onReschedule ? "cursor-grab active:cursor-grabbing" : ""}
                        `}
                        title={`${booking.contactName}${onReschedule ? " (drag to reschedule)" : ""}`}
                      >
                        {booking.contactName}
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </CardContent>

      {/* Booking Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Booking Details
              {selectedBooking && (
                <Badge
                  className={`${STATUS_COLORS[selectedBooking.status]} text-white`}
                >
                  {STATUS_LABELS[selectedBooking.status]}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">
                  {selectedBooking.contactName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.contactEmail}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.contactPhone}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Arrival</p>
                  <p className="font-medium">
                    {formatDate(selectedBooking.arrivalDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departure</p>
                  <p className="font-medium">
                    {formatDate(selectedBooking.departureDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBooking.numberOfAdults} Adults</span>
                  {selectedBooking.numberOfChildren > 0 && (
                    <span>, {selectedBooking.numberOfChildren} Children</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {selectedBooking.pickupPoint} - {selectedBooking.dropoffPoint}
                </span>
              </div>

              {selectedBooking.suggestedDestinations && (
                <div>
                  <p className="text-sm text-muted-foreground">Destinations</p>
                  <p>{selectedBooking.suggestedDestinations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
