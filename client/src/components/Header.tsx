import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Mountain, Menu, X, Shield, Moon, Sun } from "lucide-react";
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
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
      style={{ zIndex: 10000 }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Mountain
              className={`h-8 w-8 ${scrolled ? "text-primary" : "text-white drop-shadow-lg"}`}
            />
            <div>
              <h1
                className={`text-xl font-bold ${scrolled ? "text-primary" : "text-white"}`}
                style={
                  !scrolled ? { textShadow: "0 2px 4px rgba(0,0,0,0.8)" } : {}
                }
              >
                WIRO 4x4
              </h1>
              <p
                className={`text-xs ${scrolled ? "text-muted-foreground" : "text-white/90"}`}
                style={
                  !scrolled ? { textShadow: "0 1px 3px rgba(0,0,0,0.8)" } : {}
                }
              >
                {t("Kosher Off-Road Adventures", "טיולי שטח כשרים")}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("tours")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("Tours", "טיולים")}
            </button>
            <button
              onClick={() => scrollToSection("why-wiro")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("Why WIRO", "למה WIRO")}
            </button>
            <button
              onClick={() => scrollToSection("kosher")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("Kosher Info", "כשרות")}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("Contact", "צרו קשר")}
            </button>
            <Link href="/pricing">
              <span
                className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${isActive("/pricing") ? "text-primary border-b-2 border-primary pb-1" : ""}`}
                {...(isActive("/pricing")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Pricing", "מחירים")}
              </span>
            </Link>
            <Link href="/blog">
              <span
                className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${isActive("/blog") ? "text-primary border-b-2 border-primary pb-1" : ""}`}
                {...(isActive("/blog")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Blog", "בלוג")}
              </span>
            </Link>
            <Link href="/gallery">
              <span
                className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${isActive("/gallery") ? "text-primary border-b-2 border-primary pb-1" : ""}`}
                {...(isActive("/gallery")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Gallery", "גלריה")}
              </span>
            </Link>
            <Link href="/reviews">
              <span
                className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${isActive("/reviews") ? "text-primary border-b-2 border-primary pb-1" : ""}`}
                {...(isActive("/reviews")
                  ? { "aria-current": "page" as const }
                  : {})}
              >
                {t("Reviews", "חוות דעת")}
              </span>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  {t("Admin", "ניהול")}
                </span>
              </Link>
            )}
            <Link href="/book">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                {t("Book Now", "הזמינו עכשיו")}
              </Button>
            </Link>
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
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

          <div className="md:hidden flex items-center gap-3">
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
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
              className="p-6 -m-3 hover:bg-primary/10 rounded-lg transition-colors touch-manipulation relative z-[10001]"
              aria-label="Toggle menu"
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
          className="md:hidden fixed top-20 left-0 right-0 bg-background/98 backdrop-blur-md border-t border-border shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200"
          style={{ zIndex: 9998 }}
        >
          <nav className="container py-4 flex flex-col gap-3">
            <button
              onClick={() => {
                scrollToSection("tours");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t("Tours", "טיולים")}
            </button>
            <button
              onClick={() => {
                scrollToSection("why-wiro");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t("Why WIRO", "למה WIRO")}
            </button>
            <button
              onClick={() => {
                scrollToSection("kosher");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t("Kosher Info", "כשרות")}
            </button>
            <button
              onClick={() => {
                scrollToSection("contact");
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t("Contact", "צרו קשר")}
            </button>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                {t("Pricing", "מחירים")}
              </span>
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
              <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                {t("Blog", "בלוג")}
              </span>
            </Link>
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
              <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                {t("Gallery", "גלריה")}
              </span>
            </Link>
            <Link href="/reviews" onClick={() => setMobileMenuOpen(false)}>
              <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                {t("Reviews", "חוות דעת")}
              </span>
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("Admin", "ניהול")}
                </span>
              </Link>
            )}
            <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-2">
                {t("Book Now", "הזמינו עכשיו")}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
