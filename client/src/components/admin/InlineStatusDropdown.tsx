import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, type BookingStatus } from "./types";

interface InlineStatusDropdownProps {
  value: BookingStatus;
  onChange: (status: BookingStatus) => void;
  disabled?: boolean;
}

const statuses: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export function InlineStatusDropdown({
  value,
  onChange,
  disabled,
}: InlineStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={e => {
          e.stopPropagation();
          if (!disabled) setOpen(!open);
        }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary/30 ${STATUS_COLORS[value]}`}
        disabled={disabled}
      >
        {STATUS_LABELS[value]}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-36 bg-white border rounded-lg shadow-lg py-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={e => {
                e.stopPropagation();
                onChange(s);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 ${
                s === value ? "font-bold" : ""
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[s].split(" ")[0]}`}
              />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
