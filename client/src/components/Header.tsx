import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Moon, Sun, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LOGO } from "@/const";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function Header() {
  const { t } = useLanguage();
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest("header")) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-accent/20"
          : "bg-transparent"
      }`}
      style={{ zIndex: 10000 }}
    >
      <div className="container">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16 md:h-[4.5rem]" : "h-20 md:h-32 lg:h-36"}`}
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
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-12 md:h-14" : "h-16 md:h-32 lg:h-36"} ${!scrolled && isHomePage ? "drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]" : "drop-shadow-lg"}`}
            />
          </Link>

          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            <Link href="/tours">
              <span
                className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/tours") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/tours")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Tours", "טיולים")}
              </span>
            </Link>
            <Link href="/packages">
              <span
                className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/packages") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/packages")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Packages", "חבילות")}
              </span>
            </Link>
            <Link href="/pricing">
              <span
                className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/pricing") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
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
                  className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer inline-flex items-center gap-1 ${isExploreActive ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
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
                className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/contact") ? "text-accent border-b border-accent pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
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
                  className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer flex items-center gap-1 ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                >
                  <Shield className="h-4 w-4" />
                  {t("Admin", "ניהול")}
                </span>
              </Link>
            )}
            <Link href="/book">
              <Button
                variant="default"
                size="sm"
                className="bg-accent-cta hover:bg-accent-cta-hover text-white font-bold border-accent-cta hover:border-accent-cta-hover"
              >
                {t("Book Now", "הזמינו עכשיו")}
              </Button>
            </Link>
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
            className={`md:hidden flex items-center ${!scrolled && isHomePage ? "text-white" : ""}`}
          >
            <button
              onClick={toggleMobileMenu}
              className="p-3 hover:bg-accent/10 rounded-lg transition-colors touch-manipulation relative z-[10001]"
              aria-label={t("Toggle menu", "תפריט")}
              aria-expanded={mobileMenuOpen}
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
          className="md:hidden fixed inset-0 bg-background overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200"
          style={{ zIndex: 9999 }}
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
            <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="default"
                size="lg"
                className="w-full max-w-xs mt-6 bg-accent-cta hover:bg-accent-cta-hover text-white font-bold border-accent-cta hover:border-accent-cta-hover"
              >
                {t("Book Now", "הזמינו עכשיו")}
              </Button>
            </Link>
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
