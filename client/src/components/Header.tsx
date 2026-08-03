import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Shield,
  Moon,
  Sun,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LOGO } from "@/const";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function Header() {
  const { t, language } = useLanguage();
  const { theme, toggleTheme, switchable } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "admin";
  const [currentPath] = useLocation();

  const isActive = (path: string) => currentPath === path;
  const isHomePage = currentPath === "/";
  const isExploreActive = ["/gallery", "/blog", "/faq", "/car-rental"].some(
    path => currentPath.startsWith(path)
  );
  const whatsappMessage = t(
    "Hi WIRO 4x4, I'd like to check availability for a private trip. Dates: __ Group size: __ Pickup area: __",
    "שלום WIRO 4x4, אשמח לבדוק זמינות לטיול פרטי. תאריכים: __ מספר מטיילים: __ אזור איסוף: __"
  );
  const whatsappSource =
    language === "he" ? "GLOBAL-HEADER-HE" : "GLOBAL-HEADER-EN";

  useEffect(() => {
    const sentinel = document.createElement("span");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText =
      "position:absolute;top:50px;left:0;width:1px;height:1px;pointer-events:none";
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 transition-all duration-300 ${
        mobileMenuOpen
          ? "border-b border-border bg-background"
          : scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-primary/10 shadow-[0_10px_35px_rgba(11,42,34,0.06)]"
            : "bg-transparent"
      }`}
      style={{ zIndex: 10000 }}
    >
      <div className="container">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <img
              src={APP_LOGO}
              alt="WIRO 4x4 Logo"
              width={144}
              height={144}
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-12" : "h-16"} ${!scrolled && isHomePage ? "drop-shadow-[0_5px_16px_rgba(0,0,0,0.28)]" : "drop-shadow-md"}`}
            />
          </Link>

          <nav
            className="hidden lg:flex items-center gap-5"
            aria-label="Main navigation"
          >
            <Link href="/tours">
              <span
                className={`nav-link text-sm font-semibold tracking-[0.04em] transition-colors cursor-pointer ${isActive("/tours") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/tours")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Tours", "טיולים")}
              </span>
            </Link>
            <Link href="/packages">
              <span
                className={`nav-link text-sm font-semibold tracking-[0.04em] transition-colors cursor-pointer ${isActive("/packages") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/packages")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Packages", "חבילות")}
              </span>
            </Link>
            <Link href="/pricing">
              <span
                className={`nav-link text-sm font-semibold tracking-[0.04em] transition-colors cursor-pointer ${isActive("/pricing") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/pricing")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Pricing", "מחירים")}
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`nav-link text-sm font-semibold tracking-[0.04em] transition-colors cursor-pointer inline-flex items-center gap-1 ${isExploreActive ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                  aria-label={t("Explore more pages", "עמודי מידע נוספים")}
                >
                  {t("Explore", "עוד")}
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem asChild>
                  <Link href="/gallery">{t("Gallery", "גלריה")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/car-rental">{t("Car Rental", "השכרת רכב")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/faq">{t("FAQ", "שאלות נפוצות")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/blog">{t("Blog", "בלוג")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/contact">
              <span
                className={`nav-link text-sm font-semibold tracking-[0.04em] transition-colors cursor-pointer ${isActive("/contact") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/contact")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Contact", "צרו קשר")}
              </span>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <span
                  className={`nav-link text-sm font-semibold tracking-[0.04em] transition-colors cursor-pointer flex items-center gap-1 ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                >
                  <Shield className="h-4 w-4" />
                  {t("Admin", "ניהול")}
                </span>
              </Link>
            )}
            <TrackedWhatsAppLink
              sourceCode={whatsappSource}
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="default"
                size="sm"
                className="bg-accent-cta hover:bg-accent-cta-hover text-white font-bold border-accent-cta hover:border-accent-cta-hover"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t("Check Availability", "בדיקת זמינות")}
              </Button>
            </TrackedWhatsAppLink>
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                aria-label={
                  theme === "dark"
                    ? t("Switch to light mode", "מעבר למצב בהיר")
                    : t("Switch to dark mode", "מעבר למצב כהה")
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}
            <LanguageSwitcher />
          </nav>

          <div
            className={`flex items-center lg:hidden ${!mobileMenuOpen && !scrolled && isHomePage ? "text-white" : "text-foreground"}`}
          >
            <button
              onClick={toggleMobileMenu}
              className="relative z-[10001] rounded-sm p-3 transition-colors hover:bg-accent/10 touch-manipulation"
              aria-label={t("Toggle menu", "תפריט")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              type="button"
              style={{
                minWidth: "48px",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden fixed inset-0 bg-background overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200"
          style={{ zIndex: 9999 }}
          onClick={event => {
            if (event.target === event.currentTarget) {
              setMobileMenuOpen(false);
            }
          }}
        >
          <nav
            className="container pt-28 flex flex-col items-center justify-center gap-2 min-h-[calc(100vh-8rem)]"
            aria-label="Mobile navigation"
          >
            <Link href="/tours" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("Tours", "טיולים")}
              </span>
            </Link>
            <div className="h-px w-12 bg-accent/30" />
            <Link href="/packages" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("Packages", "חבילות")}
              </span>
            </Link>
            <div className="h-px w-12 bg-accent/30" />
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("Pricing", "מחירים")}
              </span>
            </Link>
            <div className="h-px w-12 bg-accent/30" />
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("Gallery", "גלריה")}
              </span>
            </Link>
            <div className="h-px w-12 bg-accent/30" />
            <Link href="/car-rental" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("Car Rental", "השכרת רכב")}
              </span>
            </Link>
            <div className="h-px w-12 bg-accent/30" />
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("Blog", "בלוג")}
              </span>
            </Link>
            <div className="h-px w-12 bg-accent/30" />
            <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("FAQ", "שאלות נפוצות")}
              </span>
            </Link>
            <div className="h-px w-12 bg-accent/30" />
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer">
                {t("Contact", "צרו קשר")}
              </span>
            </Link>
            {isAdmin && (
              <>
                <div className="h-px w-12 bg-accent/30" />
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <span className="block py-3 text-center text-2xl font-light hover:text-accent transition-colors cursor-pointer flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t("Admin", "ניהול")}
                  </span>
                </Link>
              </>
            )}
            <TrackedWhatsAppLink
              sourceCode={whatsappSource}
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="default"
                size="lg"
                className="w-full max-w-xs mt-6 bg-accent-cta hover:bg-accent-cta-hover text-white font-bold border-accent-cta hover:border-accent-cta-hover"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                {t("Check Availability", "בדיקת זמינות")}
              </Button>
            </TrackedWhatsAppLink>
            <div className="flex items-center gap-4 mt-8">
              {switchable && toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                  aria-label={
                    theme === "dark"
                      ? t("Switch to light mode", "מעבר למצב בהיר")
                      : t("Switch to dark mode", "מעבר למצב כהה")
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              )}
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
