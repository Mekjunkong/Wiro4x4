import { Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

export function EmptyStateHero() {
  const { t } = useLanguage();

  return (
    <Card className="p-8 md:p-12 border-2 border-dashed border-muted-foreground/20 text-center rounded-sm">
      {/* TODO: Replace with custom 4x4 illustration */}

      {/* Icon with circular background */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
        <Calculator className="w-8 h-8 text-[#D4AF37]" />
      </div>

      {/* Heading */}
      <h3 className="text-xl font-bold mb-2">
        {t("Start Planning Your Adventure", "התחילו לתכנן את ההרפתקה שלכם")}
      </h3>

      {/* Subtext */}
      <p className="text-muted-foreground max-w-md mx-auto">
        {t(
          "Select tours above to begin building your personalized trip estimate.",
          "בחרו טיולים למעלה כדי להתחיל לבנות את הערכת המחיר האישית שלכם."
        )}
      </p>
    </Card>
  );
}
