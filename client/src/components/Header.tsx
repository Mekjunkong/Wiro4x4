import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Shield, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO } from "@/const";
import { WaCta } from "@/components/wiro/WaCta";

/** Routes whose first screen is a full-bleed dark photo. */
function isDarkTop(path: string) {
  return (
    path === "/" ||
    path === "/gallery" ||
    path === "/packages" ||
    /^\/tours\/[^/]+$/.test(path)
  );
}

const MAIN = [
  { href: "/tours", en: "Tours", he: "טיולים" },
  { href: "/packages", en: "Packages", he: "חבילות" },
  { href: "/gallery", en: "Gallery", he: "גלריה" },
  { href: "/book", en: "Book", he: "הזמנה" },
] as const;

const MORE = [
  { href: "/motorcycle-tours", en: "Motorcycle tours", he: "טיולי אופנוע" },
  { href: "/car-rental", en: "Car rental", he: "השכרת רכב" },
  { href: "/reviews", en: "Reviews", he: "ביקורות" },
  { href: "/blog", en: "Blog", he: "בלוג" },
  { href: "/faq", en: "FAQ", he: "שאלות נפוצות" },
  { href: "/about", en: "About WIRO", he: "אודות WIRO" },
  { href: "/contact", en: "Contact", he: "צרו קשר" },
] as const;

function FlagIL() {
  return (
    <svg
      width="22"
      height="16"
      viewBox="0 0 22 16"
      aria-hidden="true"
      style={{ borderRadius: 2, display: "block" }}
    >
      <rect width="22" height="16" fill="#fbf8f1" />
      <rect y="1.6" width="22" height="2.2" fill="#0038b8" />
      <rect y="12.2" width="22" height="2.2" fill="#0038b8" />
      <polygon
        points="11,4.6 13.9,9.6 8.1,9.6"
        fill="none"
        stroke="#0038b8"
        strokeWidth="0.8"
      />
      <polygon
        points="11,11.4 13.9,6.4 8.1,6.4"
        fill="none"
        stroke="#0038b8"
        strokeWidth="0.8"
      />
    </svg>
  );
}

function FlagUK() {
  return (
    <svg
      width="22"
      height="16"
      viewBox="0 0 60 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ borderRadius: 2, display: "block" }}
    >
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fbf8f1" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#c8102e" strokeWidth="3" />
      <path d="M30,0 V40 M0,20 H60" stroke="#fbf8f1" strokeWidth="12" />
      <path d="M30,0 V40 M0,20 H60" stroke="#c8102e" strokeWidth="7" />
    </svg>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 12h16" />
          <path d="M4 6h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme, switchable } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [path] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const isAdmin = isAuthenticated && user?.role === "admin";
  const dark = isDarkTop(path);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [path]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const isActive = (href: string) =>
    path === href || path.startsWith(href + "/");

  return (
    <header
      className={`wx-header site-header ${scrolled || menuOpen ? "is-scrolled" : ""} ${dark ? "is-dark" : ""}`}
    >
      <div className="wx-header__bar">
        <Link href="/" className="wx-header__logo" aria-label="WIRO 4x4 home">
          <img src={APP_LOGO} alt="WIRO 4x4 Logo" width={144} height={144} />
        </Link>

        <nav className="wx-nav wx-desk" aria-label="Main navigation">
          {MAIN.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`wx-nav__item ${isActive(item.href) ? "is-active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {t(item.en, item.he)}
            </Link>
          ))}
          <div className="wx-more" ref={moreRef}>
            <button
              type="button"
              className="wx-nav__item"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen(o => !o)}
            >
              {t("Explore", "עוד")}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {moreOpen && (
              <div className="wx-more__panel" role="menu">
                {MORE.map(item => (
                  <Link key={item.href} href={item.href} role="menuitem">
                    {t(item.en, item.he)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="wx-header__tools">
          {isAdmin && (
            <Link
              href="/admin"
              className="wx-iconbtn wx-desk"
              aria-label={t("Admin", "ניהול")}
            >
              <Shield size={16} aria-hidden="true" />
            </Link>
          )}
          {switchable && toggleTheme && (
            <button
              type="button"
              className="wx-iconbtn"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? t("Switch to light mode", "מעבר למצב בהיר")
                  : t("Switch to dark mode", "מעבר למצב כהה")
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <button
            type="button"
            className="wx-iconbtn"
            onClick={() => setLanguage(language === "en" ? "he" : "en")}
            aria-label={
              language === "en"
                ? "Switch language to Hebrew"
                : "Switch language to English"
            }
          >
            {language === "en" ? <FlagIL /> : <FlagUK />}
            <span className="wx-sm-up">
              {language === "en" ? "עברית" : "English"}
            </span>
          </button>
          <span className="wx-desk">
            <WaCta source="GLOBAL-HEADER" className="wx-btn wx-btn--solid">
              {t("Check availability", "בדיקת זמינות")}
            </WaCta>
          </span>
          <button
            type="button"
            className="wx-iconbtn wx-iconbtn--plain wx-mob"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={t("Toggle menu", "תפריט")}
            aria-expanded={menuOpen}
            aria-controls="wx-mobile-menu"
          >
            <MenuGlyph open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="wx-mobile-menu"
          className="wx-menu"
          style={{ pointerEvents: "auto" }}
        >
          <nav
            aria-label="Mobile navigation"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {[{ href: "/", en: "Home", he: "בית" }, ...MAIN].map(item => (
              <div
                key={item.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Link href={item.href} className="wx-menu__main">
                  {t(item.en, item.he)}
                </Link>
                <span className="wx-menu__rule" />
              </div>
            ))}
            <div className="wx-menu__minor">
              {MORE.map(item => (
                <Link key={item.href} href={item.href}>
                  {t(item.en, item.he)}
                </Link>
              ))}
              {isAdmin && <Link href="/admin">{t("Admin", "ניהול")}</Link>}
            </div>
            <div style={{ marginTop: 32 }}>
              <WaCta source="GLOBAL-HEADER" className="wx-btn wx-btn--solid">
                {t("Check availability", "בדיקת זמינות")}
              </WaCta>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
