import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const { t } = useLanguage();

  const handleClick = () => {
    const message = encodeURIComponent(
      t(
        "Hi WIRO 4x4 – I want to book a Kosher tour.",
        "היי WIRO 4x4 — אשמח לשמוע על הטיולים הכשרים שלכם."
      )
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-premium-lg transition-all duration-300 hover:scale-110 group"
      aria-label={t("Contact us on WhatsApp", "צרו קשר בוואטסאפ")}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {t("Chat with us", "שלחו הודעה")}
      </span>
    </button>
  );
}
