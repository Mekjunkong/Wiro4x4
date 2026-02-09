import { MapPin } from "lucide-react";
import { type FormStepProps, DESTINATIONS } from "./types";

export function DestinationsStep({
  formData,
  setFormData,
  isHebrew,
  t,
}: FormStepProps) {
  const toggleDestination = (id: string) => {
    setFormData(prev => ({
      ...prev,
      suggestedDestinations: prev.suggestedDestinations.includes(id)
        ? prev.suggestedDestinations.filter(d => d !== id)
        : [...prev.suggestedDestinations, id],
    }));
  };

  return (
    <fieldset className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
      <legend className="text-xl md:text-2xl font-serif font-bold text-primary flex items-center gap-2 px-2">
        <MapPin className="w-6 h-6" />
        {t("Suggested Travel Destinations", "יעדים מומלצים")}
      </legend>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {DESTINATIONS.map(dest => (
          <label
            key={dest.id}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.suggestedDestinations.includes(dest.id)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.suggestedDestinations.includes(dest.id)}
              onChange={() => toggleDestination(dest.id)}
              className="w-6 h-6 md:w-5 md:h-5 rounded border-border text-primary focus:ring-primary touch-manipulation"
            />
            <span className="font-medium">{isHebrew ? dest.he : dest.en}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
