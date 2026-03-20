import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Calendar, Star } from "lucide-react";
import { Link } from "wouter";

interface AvailabilityCalendarProps {
  tourId: number | null;
  tourSlug: string;
  tourName: string;
  tourNameHe: string;
}

const EN_MONTHS = [
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
const HE_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HE_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

/**
 * Check if a date falls on Shabbat (Friday sundown to Saturday sundown).
 * For simplicity, we mark Friday and Saturday as Shabbat dates.
 */
function isShabbatDate(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  return day === 5 || day === 6; // Friday or Saturday
}

function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T12:00:00");
  return d < today;
}

export function AvailabilityCalendar({
  tourId,
  tourSlug,
  tourName: _tourName,
  tourNameHe: _tourNameHe,
}: AvailabilityCalendarProps) {
  const { t, language } = useLanguage();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: availability, isLoading } =
    trpc.availability.getByTour.useQuery(
      { tourId: tourId ?? 0, year, month },
      { enabled: tourId !== null && tourId > 0 }
    );

  // Build calendar grid
  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    // Create availability map
    const availMap = new Map<
      string,
      { available: number; isBlocked: boolean; notes: string | null }
    >();
    if (availability) {
      for (const a of availability) {
        availMap.set(a.date, {
          available: a.available,
          isBlocked: a.isBlocked,
          notes: a.notes,
        });
      }
    }

    // Build grid rows (6 weeks max)
    const cells: (null | {
      day: number;
      dateStr: string;
      available: number;
      isBlocked: boolean;
      isPast: boolean;
      isShabbat: boolean;
      notes: string | null;
    })[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const avail = availMap.get(dateStr);
      cells.push({
        day,
        dateStr,
        available: avail?.available ?? 10,
        isBlocked: avail?.isBlocked ?? false,
        isPast: isPastDate(dateStr),
        isShabbat: isShabbatDate(dateStr),
        notes: avail?.notes ?? null,
      });
    }

    return cells;
  }, [year, month, availability]);

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  // Don't allow navigating more than 6 months back
  const canGoPrev = (() => {
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 1);
    return (
      year > minDate.getFullYear() ||
      (year === minDate.getFullYear() && month > minDate.getMonth() + 1)
    );
  })();

  // Don't allow navigating more than 12 months forward
  const canGoNext = (() => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 12);
    return (
      year < maxDate.getFullYear() ||
      (year === maxDate.getFullYear() && month < maxDate.getMonth() + 1)
    );
  })();

  const selectedInfo = selectedDate
    ? calendarData.find(c => c?.dateStr === selectedDate)
    : null;

  const dayNames = language === "he" ? HE_DAYS : EN_DAYS;
  const monthNames = language === "he" ? HE_MONTHS : EN_MONTHS;

  // If no tour ID (fallback tour), show a simplified message
  if (tourId === null || tourId <= 0) {
    return (
      <div>
        <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-accent" />
          {t("Check Availability", "בדיקת זמינות")}
        </h2>
        <div className="p-6 rounded-sm border border-border bg-muted/30 text-center">
          <p className="text-muted-foreground mb-3">
            {t(
              "Contact us via WhatsApp to check available dates for this tour.",
              "צרו קשר בוואטסאפ לבדיקת תאריכים זמינים לטיול זה."
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-accent" />
        {t("Check Availability", "בדיקת זמינות")}
      </h2>

      <div className="border border-border rounded-sm overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between p-4 bg-primary/5">
          <button
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-sm hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("Previous month", "חודש קודם")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {monthNames[month - 1]} {year}
          </h3>
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-sm hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("Next month", "חודש הבא")}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {dayNames.map((d, i) => (
            <div
              key={d}
              className={`py-2 text-center text-xs font-semibold uppercase tracking-wide ${
                i === 5 || i === 6 ? "text-accent/70" : "text-muted-foreground"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarData.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="p-1 min-h-[48px] md:min-h-[56px]"
                  />
                );
              }

              const isUnavailable =
                cell.isPast || cell.isBlocked || cell.available <= 0;
              const isLimited =
                !isUnavailable && cell.available > 0 && cell.available <= 3;
              const _isAvailable = !isUnavailable && cell.available > 3;
              const isSelected = selectedDate === cell.dateStr;

              let bgClass = "";
              let textClass = "text-foreground";
              let cursor = "cursor-pointer";

              if (cell.isPast) {
                bgClass = "bg-muted/50";
                textClass = "text-muted-foreground/50";
                cursor = "cursor-not-allowed";
              } else if (cell.isBlocked) {
                bgClass = "bg-muted/70";
                textClass = "text-muted-foreground/60";
                cursor = "cursor-not-allowed";
              } else if (cell.available <= 0) {
                bgClass = "bg-red-50 dark:bg-red-950/30";
                textClass = "text-red-400";
                cursor = "cursor-not-allowed";
              } else if (isLimited) {
                bgClass = "bg-amber-50 dark:bg-amber-950/30";
                textClass = "text-amber-700 dark:text-amber-400";
              } else {
                bgClass = "bg-green-50/50 dark:bg-green-950/20";
                textClass = "text-green-700 dark:text-green-400";
              }

              if (isSelected && !isUnavailable) {
                bgClass = "bg-accent/20 ring-2 ring-accent";
                textClass = "text-accent font-bold";
              }

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => {
                    if (!isUnavailable) {
                      setSelectedDate(isSelected ? null : cell.dateStr);
                    }
                  }}
                  disabled={isUnavailable}
                  className={`relative p-1 min-h-[48px] md:min-h-[56px] border-[0.5px] border-border/30 transition-all ${bgClass} ${textClass} ${cursor} hover:opacity-80 disabled:hover:opacity-100 flex flex-col items-center justify-center gap-0.5`}
                  aria-label={`${cell.day} ${monthNames[month - 1]} - ${
                    isUnavailable
                      ? t("Unavailable", "לא זמין")
                      : `${cell.available} ${t("slots", "מקומות")}`
                  }`}
                >
                  <span className="text-sm md:text-base font-medium">
                    {cell.day}
                  </span>
                  {/* Availability indicator dot */}
                  {!cell.isPast && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cell.isBlocked || cell.available <= 0
                          ? "bg-red-400"
                          : isLimited
                            ? "bg-amber-400"
                            : "bg-green-500"
                      }`}
                    />
                  )}
                  {/* Shabbat indicator */}
                  {cell.isShabbat && !cell.isPast && (
                    <Star className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-accent/50" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            {t("Available", "זמין")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            {t("Limited", "מוגבל")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            {t("Fully Booked", "מלא")}
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-2.5 h-2.5 text-accent/50" />
            {t("Shabbat", "שבת")}
          </span>
        </div>

        {/* Selected date info panel */}
        {selectedInfo &&
          !selectedInfo.isPast &&
          !selectedInfo.isBlocked &&
          selectedInfo.available > 0 && (
            <div className="p-4 border-t border-border bg-accent/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">
                    {new Date(
                      selectedInfo.dateStr + "T12:00:00"
                    ).toLocaleDateString(
                      language === "he" ? "he-IL" : "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInfo.available}{" "}
                    {t("spots available", "מקומות פנויים")}
                    {selectedInfo.isShabbat && (
                      <span className="ml-2 text-accent">
                        ({t("Shabbat", "שבת")})
                      </span>
                    )}
                    {selectedInfo.notes && (
                      <span className="ml-2 text-muted-foreground italic">
                        — {selectedInfo.notes}
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/booking?tour=${tourSlug}&date=${selectedInfo.dateStr}`}
                >
                  <button className="px-5 py-2.5 bg-accent text-primary font-semibold rounded-sm hover:bg-accent/90 transition-colors text-sm whitespace-nowrap">
                    {t("Book This Date", "הזמינו תאריך זה")}
                  </button>
                </Link>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
