import { useState } from "react";
import { Mail, Link as LinkIcon, Check, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_WHATSAPP_URL } from "@/const";

interface SaveEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateData: {
    selectedTours: Array<{ slug?: string; name: string }>;
    adults: number;
    children: number[];
    arrivalDate: string;
    departureDate: string;
    includesHotels: boolean;
    includesFood: boolean;
    includesAttractions: boolean;
    attractionCount: number;
    needsShabbatHotel: boolean;
  };
}

export function SaveEstimateModal({
  isOpen,
  onClose,
  estimateData,
}: SaveEstimateModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate shareable URL
  const generateShareableUrl = () => {
    const params = new URLSearchParams();

    // Tours
    if (estimateData.selectedTours.length > 0) {
      const tourSlugs = estimateData.selectedTours
        .map(t => t.slug || t.name.toLowerCase().replace(/\s+/g, "-"))
        .join(",");
      params.set("tours", tourSlugs);
    }

    // Group
    params.set("adults", estimateData.adults.toString());
    if (estimateData.children.length > 0) {
      params.set("children", estimateData.children.join(","));
    }

    // Dates
    if (estimateData.arrivalDate)
      params.set("arrival", estimateData.arrivalDate);
    if (estimateData.departureDate)
      params.set("departure", estimateData.departureDate);

    // Services
    if (estimateData.includesHotels) params.set("hotels", "true");
    if (estimateData.includesFood) params.set("food", "true");
    if (estimateData.includesAttractions) {
      params.set("attractions", "true");
      params.set("attractionCount", estimateData.attractionCount.toString());
    }
    if (estimateData.needsShabbatHotel) params.set("shabbat", "true");

    return `${window.location.origin}/estimate-v2?${params.toString()}`;
  };

  const shareableUrl = generateShareableUrl();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      console.log("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Check out my Chiang Mai trip estimate: ${shareableUrl}`
    );
    window.open(`${COMPANY_WHATSAPP_URL}&text=${message}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("Save & Share Your Estimate", "שמירה ושיתוף הצעת המחיר")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <LinkIcon className="w-4 h-4 mr-2" />
              {t("Get Link", "קבלו קישור")}
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              {t("Email Me", "שלחו לי במייל")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("Shareable Link", "קישור לשיתוף")}
              </label>
              <Input
                value={shareableUrl}
                readOnly
                className="text-sm"
                onClick={e => e.currentTarget.select()}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-sm hover:bg-[#D4AF37]/90 transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t("Copied!", "הועתק!")}
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    {t("Copy Link", "העתיקו קישור")}
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="px-4 py-2 border border-border rounded-sm hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {t("WhatsApp", "וואטסאפ")}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t(
                "This link will load your estimate with all selections pre-filled.",
                "הקישור יטען את הצעת המחיר עם כל הבחירות."
              )}
            </p>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t("Email Address", "כתובת מייל")} *
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t("your@email.com", "your@email.com")}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                {t("Name", "שם")} {t("(optional)", "(אופציונלי)")}
              </label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t("Your name", "השם שלך")}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                {t("Notes", "הערות")} {t("(optional)", "(אופציונלי)")}
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t(
                  "Any special requests or questions...",
                  "בקשות מיוחדות או שאלות..."
                )}
                rows={3}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-sm text-amber-800">
              {t(
                "Email feature coming soon! For now, please use the 'Get Link' tab to save your estimate.",
                "תכונת המייל תגיע בקרוב! לעת עתה, אנא השתמשו בלשונית 'קבלו קישור' כדי לשמור את ההצעה."
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
