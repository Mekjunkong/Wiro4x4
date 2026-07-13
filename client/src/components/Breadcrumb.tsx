import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const { t, language } = useLanguage();
  const Chevron = language === "he" ? ChevronLeft : ChevronRight;
  const allItems: BreadcrumbItem[] = [
    { label: t("Home", "דף הבית"), href: "/" },
    ...items,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `https://www.wiro4x4indochina.com${item.href}` }
        : {}),
    })),
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="px-4 pb-3 pt-20 sm:px-6 md:pt-24 lg:px-8 lg:pt-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && <Chevron className="w-3.5 h-3.5 shrink-0" />}
            {index === 0 && <Home className="w-3.5 h-3.5 shrink-0" />}
            {item.href && index < allItems.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
