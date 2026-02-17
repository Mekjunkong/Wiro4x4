import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Link2,
  Check,
} from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  excerpt: string;
}

export function ShareButtons({ url, title, excerpt }: ShareButtonsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttons = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-green-100 hover:text-green-700",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-100 hover:text-blue-700",
    },
    {
      label: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:bg-sky-100 hover:text-sky-700",
    },
  ];

  return (
    <div className="flex items-center gap-2 py-4 border-t border-border mt-8">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 className="w-4 h-4" />
        {t("Share", "\u05E9\u05EA\u05E4\u05D5")}
      </span>
      {buttons.map(({ label, icon: Icon, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          className={`p-2 rounded-full transition-colors ${color}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={handleCopy}
        title={t(
          "Copy link",
          "\u05D4\u05E2\u05EA\u05E7\u05EA \u05E7\u05D9\u05E9\u05D5\u05E8"
        )}
        className="p-2 rounded-full hover:bg-muted transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
