import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Mountain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';

export function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">WIRO 4x4</h1>
              <p className="text-xs text-muted-foreground">
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
            <Link href="/book">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                {t('Book Now', 'הזמן עכשיו')}
              </Button>
            </Link>
            <LanguageSwitcher />
          </nav>

          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
