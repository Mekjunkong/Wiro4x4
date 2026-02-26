import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Moon, Sun } from "lucide-react";
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
  const [currentPath, setLocation] = useLocation();

  const isActive = (path: string) => currentPath === path;
  const isHomePage = currentPath === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
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

  const scrollToSection = (id: string) => {
    if (currentPath !== "/") {
      setLocation("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAF7F2]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#D4AF37]/20"
          : "bg-transparent"
      }`}
      style={{ zIndex: 10000 }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-24 md:h-32 lg:h-36">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <img
              src={APP_LOGO}
              alt="WIRO 4x4 Logo"
              className={`h-24 md:h-32 lg:h-36 w-auto object-contain ${!scrolled && isHomePage ? "drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]" : "drop-shadow-lg"}`}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("tours")}
              className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
            >
              {t("Tours", "טיולים")}
            </button>
            <button
              onClick={() => scrollToSection("why-wiro")}
              className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
            >
              {t("Why WIRO", "למה WIRO")}
            </button>
            <button
              onClick={() => scrollToSection("kosher")}
              className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
            >
              {t("Kosher Info", "כשרות")}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
            >
              {t("Contact", "צרו קשר")}
            </button>
            <Link href="/pricing">
              <span
                className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/pricing") ? "text-[#D4AF37] border-b border-[#D4AF37] pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/pricing")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Pricing", "מחירים")}
              </span>
            </Link>
            <Link href="/gallery">
              <span
                className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/gallery") ? "text-[#D4AF37] border-b border-[#D4AF37] pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/gallery")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Gallery", "גלריה")}
              </span>
            </Link>
            <Link href="/blog">
              <span
                className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/blog") ? "text-[#D4AF37] border-b border-[#D4AF37] pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
                {...(isActive("/blog")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Blog", "בלוג")}
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
                className="bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold border-[#d4af37] hover:border-[#c5a033]"
              >
                {t("Book Now", "הזמינו עכשיו")}
              </Button>
            </Link>
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
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
            className={`md:hidden flex items-center gap-3 ${!scrolled && isHomePage ? "text-white" : ""}`}
          >
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
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
            <button
              onClick={toggleMobileMenu}
              className="p-6 -m-3 hover:bg-[#D4AF37]/10 rounded-lg transition-colors touch-manipulation relative z-[10001]"
              aria-label={t("Toggle menu", "תפריט")}
              aria-expanded={mobileMenuOpen}
              type="button"
              style={{
                minWidth: "80px",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mobileMenuOpen ? (
                <X className="h-10 w-10" />
              ) : (
                <Menu className="h-10 w-10" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#FAF7F2] dark:bg-[#1A1A1A] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200"
          style={{ zIndex: 9999 }}
        >
          <nav className="container pt-28 flex flex-col items-center justify-center gap-2 min-h-[calc(100vh-8rem)]">
            <button
              onClick={() => {
                scrollToSection("tours");
                setMobileMenuOpen(false);
              }}
              className="py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors touch-manipulation"
              type="button"
            >
              {t("Tours", "טיולים")}
            </button>
            <div className="h-px w-12 bg-[#D4AF37]/30" />
            <button
              onClick={() => {
                scrollToSection("why-wiro");
                setMobileMenuOpen(false);
              }}
              className="py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors touch-manipulation"
              type="button"
            >
              {t("Why WIRO", "למה WIRO")}
            </button>
            <div className="h-px w-12 bg-[#D4AF37]/30" />
            <button
              onClick={() => {
                scrollToSection("kosher");
                setMobileMenuOpen(false);
              }}
              className="py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors touch-manipulation"
              type="button"
            >
              {t("Kosher Info", "כשרות")}
            </button>
            <div className="h-px w-12 bg-[#D4AF37]/30" />
            <button
              onClick={() => {
                scrollToSection("contact");
                setMobileMenuOpen(false);
              }}
              className="py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors touch-manipulation"
              type="button"
            >
              {t("Contact", "צרו קשר")}
            </button>
            <div className="h-px w-12 bg-[#D4AF37]/30" />
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors cursor-pointer">
                {t("Pricing", "מחירים")}
              </span>
            </Link>
            <div className="h-px w-12 bg-[#D4AF37]/30" />
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors cursor-pointer">
                {t("Gallery", "גלריה")}
              </span>
            </Link>
            <div className="h-px w-12 bg-[#D4AF37]/30" />
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors cursor-pointer">
                {t("Blog", "בלוג")}
              </span>
            </Link>
            {isAdmin && (
              <>
                <div className="h-px w-12 bg-[#D4AF37]/30" />
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <span className="block py-3 text-center text-2xl font-light hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-2">
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
                className="w-full max-w-xs mt-6 bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold border-[#d4af37] hover:border-[#c5a033]"
              >
                {t("Book Now", "הזמינו עכשיו")}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
