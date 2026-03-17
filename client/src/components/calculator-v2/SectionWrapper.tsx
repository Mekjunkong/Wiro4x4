import { ChevronDown } from "lucide-react";
import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  title: string;
  sectionId: string;
  isExpanded: boolean;
  onToggle: () => void;
  stepNumber: number;
  children: ReactNode;
}

export function SectionWrapper({
  title,
  sectionId,
  isExpanded,
  onToggle,
  stepNumber,
  children,
}: SectionWrapperProps) {
  const contentId = `section-content-${sectionId}`;

  return (
    <Card className="border-accent/30 rounded-sm overflow-hidden">
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
            "border-2 border-accent",
            "flex items-center justify-center",
            "font-semibold text-sm",
            "transition-all duration-300"
          )}
        >
          <span>{stepNumber}</span>
        </div>

        {/* Title */}
        <span className="font-semibold text-base md:text-lg flex-grow">
          {title}
        </span>

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
