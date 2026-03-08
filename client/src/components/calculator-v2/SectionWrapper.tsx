import { type LucideIcon, ChevronDown, Check } from "lucide-react";
import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  title: string;
  icon: LucideIcon;
  isComplete: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  summaryPill?: ReactNode;
  stepNumber: number;
  children: ReactNode;
}

export function SectionWrapper({
  title,
  icon: Icon,
  isComplete,
  isExpanded,
  onToggle,
  summaryPill,
  stepNumber,
  children,
}: SectionWrapperProps) {
  const contentId = `section-content-${stepNumber}`;

  return (
    <Card className="border-[#D4AF37]/30 rounded-sm overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full min-h-[48px] p-5 md:p-6",
          "flex items-center gap-4",
          "transition-all duration-300",
          "hover:bg-muted/50",
          "text-left"
        )}
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        {/* Step Number Badge */}
        <div
          className={cn(
            "flex-shrink-0",
            "w-8 h-8 rounded-full",
            "border-2 border-[#D4AF37]",
            "flex items-center justify-center",
            "font-semibold text-sm",
            "transition-all duration-300"
          )}
        >
          {isComplete ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <span>{stepNumber}</span>
          )}
        </div>

        {/* Icon */}
        <Icon className="w-5 h-5 flex-shrink-0" />

        {/* Title */}
        <span className="font-semibold text-base md:text-lg flex-grow">
          {title}
        </span>

        {/* Summary Pill - Only shown when collapsed */}
        {!isExpanded && summaryPill && (
          <div className="hidden sm:block flex-shrink-0">{summaryPill}</div>
        )}

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "w-5 h-5 flex-shrink-0",
            "transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Collapsible Content */}
      <div
        id={contentId}
        className={cn(
          "transition-all duration-300 ease-out",
          "overflow-hidden",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-5 md:p-6 pt-0">{children}</div>
      </div>
    </Card>
  );
}
