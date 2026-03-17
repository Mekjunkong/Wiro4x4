// client/src/components/calculator-v2/ProgressIndicator.tsx
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressIndicatorProps {
  completedSections: Set<"tours" | "group" | "dates" | "services">;
  currentSection: "tours" | "group" | "dates" | "services" | null;
}

const STEPS = [
  { id: "tours", labelEn: "Tours", labelHe: "טיולים", number: 1 },
  { id: "group", labelEn: "Group", labelHe: "קבוצה", number: 2 },
  { id: "dates", labelEn: "Dates", labelHe: "תאריכים", number: 3 },
  { id: "services", labelEn: "Services", labelHe: "שירותים", number: 4 },
] as const;

export function ProgressIndicator({
  completedSections,
  currentSection,
}: ProgressIndicatorProps) {
  const { language } = useLanguage();
  const isHebrew = language === "he";

  const getStepState = (stepId: string) => {
    if (completedSections.has(stepId as any)) return "complete";
    if (currentSection === stepId) return "current";
    return "incomplete";
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, index) => {
          const state = getStepState(step.id);
          const isComplete = state === "complete";
          const isCurrent = state === "current";
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300
                    ${
                      isComplete
                        ? "bg-green-600 text-white"
                        : isCurrent
                          ? "border-2 border-accent bg-card text-accent"
                          : "border-2 border-border bg-card text-muted-foreground"
                    }
                  `}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-2 font-medium
                    ${
                      isComplete || isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  `}
                >
                  {isHebrew ? step.labelHe : step.labelEn}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 transition-all duration-300
                    ${isComplete ? "bg-green-600" : "bg-border"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
