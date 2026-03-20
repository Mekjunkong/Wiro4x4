import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Tour } from "../../../../drizzle/schema";

const MONTH_NAMES = [
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
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AvailabilityManagerProps {
  tour: Tour;
  open: boolean;
  onClose: () => void;
}

export function AvailabilityManager({
  tour,
  open,
  onClose,
}: AvailabilityManagerProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<
    "block" | "unblock" | "capacity"
  >("block");
  const [bulkCapacity, setBulkCapacity] = useState(tour.groupMaxSize ?? 10);
  const [bulkNotes, setBulkNotes] = useState("");

  const { data: availability, refetch } = trpc.availability.getByTour.useQuery(
    { tourId: tour.id, year, month },
    { enabled: open }
  );

  const updateMut = trpc.availability.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Availability updated");
    },
    onError: () => toast.error("Failed to update availability"),
  });

  const bulkUpdateMut = trpc.availability.bulkUpdate.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDates(new Set());
      toast.success("Bulk update complete");
    },
    onError: () => toast.error("Failed to bulk update"),
  });

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const availMap = new Map<
      string,
      {
        available: number;
        isBlocked: boolean;
        notes: string | null;
        maxSlots: number;
        bookedSlots: number;
      }
    >();
    if (availability) {
      for (const a of availability) {
        availMap.set(a.date, a);
      }
    }

    const cells: (null | {
      day: number;
      dateStr: string;
      available: number;
      isBlocked: boolean;
      notes: string | null;
      maxSlots: number;
      bookedSlots: number;
    })[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const avail = availMap.get(dateStr);
      const defaultSlots = tour.groupMaxSize ?? 10;
      cells.push({
        day,
        dateStr,
        available: avail?.available ?? defaultSlots,
        isBlocked: avail?.isBlocked ?? false,
        notes: avail?.notes ?? null,
        maxSlots: avail?.maxSlots ?? defaultSlots,
        bookedSlots: avail?.bookedSlots ?? 0,
      });
    }

    return cells;
  }, [year, month, availability, tour.groupMaxSize]);

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  const selectAllSaturdays = () => {
    const newSet = new Set(selectedDates);
    for (const cell of calendarCells) {
      if (cell) {
        const d = new Date(cell.dateStr + "T12:00:00");
        if (d.getDay() === 6) newSet.add(cell.dateStr);
      }
    }
    setSelectedDates(newSet);
  };

  const selectAllFridaySaturday = () => {
    const newSet = new Set(selectedDates);
    for (const cell of calendarCells) {
      if (cell) {
        const d = new Date(cell.dateStr + "T12:00:00");
        if (d.getDay() === 5 || d.getDay() === 6) newSet.add(cell.dateStr);
      }
    }
    setSelectedDates(newSet);
  };

  const handleBulkApply = () => {
    if (selectedDates.size === 0) {
      toast.error("Select dates first");
      return;
    }

    const dates = Array.from(selectedDates).sort();

    if (bulkAction === "block") {
      bulkUpdateMut.mutate({
        tourId: tour.id,
        dates,
        isBlocked: true,
        notes: bulkNotes || "Blocked",
      });
    } else if (bulkAction === "unblock") {
      bulkUpdateMut.mutate({
        tourId: tour.id,
        dates,
        isBlocked: false,
        notes: bulkNotes || null,
      });
    } else if (bulkAction === "capacity") {
      bulkUpdateMut.mutate({
        tourId: tour.id,
        dates,
        maxSlots: bulkCapacity,
        notes: bulkNotes || null,
      });
    }
  };

  const handleSingleToggle = (dateStr: string, currentlyBlocked: boolean) => {
    updateMut.mutate({
      tourId: tour.id,
      date: dateStr,
      isBlocked: !currentlyBlocked,
      notes: !currentlyBlocked ? "Blocked" : null,
    });
  };

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else setMonth(month - 1);
    setSelectedDates(new Set());
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else setMonth(month + 1);
    setSelectedDates(new Set());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Availability: {tour.name}</DialogTitle>
          <DialogDescription>
            Manage capacity and block dates for this tour.
          </DialogDescription>
        </DialogHeader>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 text-xs mb-1">
          {DAY_NAMES.map(d => (
            <div
              key={d}
              className="text-center font-semibold text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-4">
          {calendarCells.map((cell, idx) => {
            if (!cell) return <div key={`e-${idx}`} className="min-h-[44px]" />;

            const isSelected = selectedDates.has(cell.dateStr);
            let bg = "bg-green-50 border-green-200";
            let text = "text-green-700";

            if (cell.isBlocked) {
              bg = "bg-gray-100 border-gray-300";
              text = "text-gray-500";
            } else if (cell.available <= 0) {
              bg = "bg-red-50 border-red-200";
              text = "text-red-500";
            } else if (cell.available <= 3) {
              bg = "bg-amber-50 border-amber-200";
              text = "text-amber-600";
            }

            if (isSelected) {
              bg = "bg-accent/20 border-accent ring-1 ring-accent";
              text = "text-accent";
            }

            return (
              <button
                key={cell.dateStr}
                onClick={() => toggleDate(cell.dateStr)}
                onDoubleClick={() =>
                  handleSingleToggle(cell.dateStr, cell.isBlocked)
                }
                className={`min-h-[44px] border rounded text-xs flex flex-col items-center justify-center gap-0.5 transition-all ${bg} ${text} hover:opacity-80`}
                title={`${cell.dateStr}: ${cell.isBlocked ? "BLOCKED" : `${cell.available}/${cell.maxSlots} available`}${cell.notes ? ` (${cell.notes})` : ""}\nClick to select, double-click to toggle block`}
              >
                <span className="font-medium">{cell.day}</span>
                <span className="text-[10px]">
                  {cell.isBlocked
                    ? "X"
                    : `${cell.bookedSlots}/${cell.maxSlots}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={selectAllSaturdays}
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Select Saturdays
          </button>
          <button
            onClick={selectAllFridaySaturday}
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Select Fri+Sat (Shabbat)
          </button>
          <button
            onClick={() => setSelectedDates(new Set())}
            className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
          >
            Clear Selection ({selectedDates.size})
          </button>
        </div>

        {/* Bulk action panel */}
        {selectedDates.size > 0 && (
          <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold">
              Bulk Action ({selectedDates.size} date
              {selectedDates.size > 1 ? "s" : ""} selected)
            </p>

            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="radio"
                  name="bulkAction"
                  checked={bulkAction === "block"}
                  onChange={() => setBulkAction("block")}
                />
                Block Dates
              </label>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="radio"
                  name="bulkAction"
                  checked={bulkAction === "unblock"}
                  onChange={() => setBulkAction("unblock")}
                />
                Unblock Dates
              </label>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="radio"
                  name="bulkAction"
                  checked={bulkAction === "capacity"}
                  onChange={() => setBulkAction("capacity")}
                />
                Set Capacity
              </label>
            </div>

            {bulkAction === "capacity" && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">
                  Max slots:
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={bulkCapacity}
                  onChange={e => setBulkCapacity(Number(e.target.value))}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Notes:</label>
              <input
                type="text"
                value={bulkNotes}
                onChange={e => setBulkNotes(e.target.value)}
                placeholder="e.g., Holiday, Shabbat"
                className="flex-1 px-2 py-1 border rounded text-sm"
                maxLength={500}
              />
            </div>

            <button
              onClick={handleBulkApply}
              disabled={bulkUpdateMut.isPending}
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {bulkUpdateMut.isPending
                ? "Applying..."
                : "Apply to Selected Dates"}
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-50 border border-green-200" />{" "}
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" />{" "}
            Limited (&le;3)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />{" "}
            Full
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />{" "}
            Blocked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-accent/20 border border-accent" />{" "}
            Selected
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground mt-2">
          Tip: Click to select dates, then apply bulk actions. Double-click a
          single date to toggle block/unblock.
        </p>
      </DialogContent>
    </Dialog>
  );
}
