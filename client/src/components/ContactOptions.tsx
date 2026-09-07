import { Mail, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  COMPANY_EMAIL,
  COMPANY_WHATSAPP_URL,
  COMPANY_PHONE,
} from "@shared/const";

export function ContactOptions({
  topic = "group",
}: {
  topic?: "group" | "motorcycle";
}) {
  const { t } = useLanguage();
  const subject =
    topic === "motorcycle"
      ? "Motorcycle tour inquiry"
      : "Organized group trip inquiry";
  const message = t(
    `Hi WIRO! I'd like to plan a ${topic === "motorcycle" ? "motorcycle tour" : "group trip"}. Our dates: . Group size: . Destinations: .`,
    `שלום WIRO! נשמח לתכנן ${topic === "motorcycle" ? "טיול אופנועים" : "טיול קבוצתי"}. תאריכים: . מספר משתתפים: . יעדים: .`
  );
  return (
    <div className="flex flex-col gap-3">
      <Button asChild className="h-auto min-h-12 whitespace-normal py-3">
        <a
          href={`${COMPANY_WHATSAPP_URL}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle aria-hidden="true" />
          {t("WhatsApp", "וואטסאפ")} <span dir="ltr">{COMPANY_PHONE}</span>
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        className="h-auto min-h-12 whitespace-normal py-3"
      >
        <a
          href={`mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
        >
          <Mail aria-hidden="true" />
          <span className="break-all">{COMPANY_EMAIL}</span>
        </a>
      </Button>
    </div>
  );
}
