import { Calendar, Clock, Share2, Link2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";

interface BlogPostMetaProps {
  date: string;
  readTime: string;
}

export function BlogPostMeta({ date, readTime }: BlogPostMetaProps) {
  const { t } = useLanguage();
  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = typeof document !== "undefined" ? document.title : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("Link copied!", "הקישור הועתק!"));
    } catch {
      toast.error(t("Failed to copy", "לא הצלחנו להעתיק"));
    }
    setShareOpen(false);
  };

  const handleWhatsAppShare = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
      "_blank"
    );
    setShareOpen(false);
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
    setShareOpen(false);
  };

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
      {date && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
      )}
      {readTime && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{readTime}</span>
        </div>
      )}
      <div className="ml-auto relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShareOpen(!shareOpen)}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t("Share", "שתף")}
        </Button>
        {shareOpen && (
          <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              onClick={handleFacebookShare}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Facebook
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              <Link2 className="h-4 w-4" />
              {t("Copy Link", "העתק קישור")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
