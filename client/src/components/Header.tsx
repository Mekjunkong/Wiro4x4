import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Mountain, Menu, X, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

export function Header() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('header')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
      style={{ zIndex: 10000 }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Mountain className={`h-8 w-8 ${scrolled ? 'text-primary' : 'text-white drop-shadow-lg'}`} />
            <div>
              <h1 className={`text-xl font-bold ${scrolled ? 'text-primary' : 'text-white'}`} style={!scrolled ? { textShadow: '0 2px 4px rgba(0,0,0,0.8)' } : {}}>
                WIRO 4x4
              </h1>
              <p className={`text-xs ${scrolled ? 'text-muted-foreground' : 'text-white/90'}`} style={!scrolled ? { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } : {}}>
                {t('Kosher Off-Road Adventures', 'חוויות שטח כשרות')}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('tours')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t('Tours', 'סיורים')}
            </button>
            <button
              onClick={() => scrollToSection('why-wiro')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t('Why WIRO', 'למה WIRO')}
            </button>
            <button
              onClick={() => scrollToSection('kosher')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t('Kosher Info', 'כשרות')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t('Contact', 'צור קשר')}
            </button>
            <Link href="/pricing">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t('Pricing', 'מחירים')}
              </span>
            </Link>
            <Link href="/blog">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t('Blog', 'בלוג')}
              </span>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  {t('Admin', 'ניהול')}
                </span>
              </Link>
            )}
            <Link href="/book">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                {t('Book Now', 'הזמן עכשיו')}
              </Button>
            </Link>
            <LanguageSwitcher />
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed top-20 left-0 right-0 bg-background/98 backdrop-blur-md border-t border-border shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ zIndex: 9998 }}
      >
          <nav className="container py-4 flex flex-col gap-3">
            <button
              onClick={() => {
                scrollToSection('tours');
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t('Tours', 'סיורים')}
            </button>
            <button
              onClick={() => {
                scrollToSection('why-wiro');
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t('Why WIRO', 'למה WIRO')}
            </button>
            <button
              onClick={() => {
                scrollToSection('kosher');
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t('Kosher Info', 'כשרות')}
            </button>
            <button
              onClick={() => {
                scrollToSection('contact');
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors touch-manipulation"
              type="button"
            >
              {t('Contact', 'צור קשר')}
            </button>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                {t('Pricing', 'מחירים')}
              </span>
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
              <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                {t('Blog', 'בלוג')}
              </span>
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <span className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('Admin', 'ניהול')}
                </span>
              </Link>
            )}
            <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-2">
                {t('Book Now', 'הזמן עכשיו')}
              </Button>
            </Link>
          </nav>
        </div>
    </header>
  );
}
