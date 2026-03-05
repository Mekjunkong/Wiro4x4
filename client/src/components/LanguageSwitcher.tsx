import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "he" : "en")}
      className="text-2xl px-2"
      title={language === "en" ? "Switch to Hebrew" : "עברו לאנגלית"}
      aria-label={
        language === "en"
          ? "Switch language to Hebrew"
          : "Switch language to English"
      }
    >
      {language === "en" ? "🇮🇱" : "🇬🇧"}
    </Button>
  );
}
