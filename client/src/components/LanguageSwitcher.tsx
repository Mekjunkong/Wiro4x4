import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'עברית' : 'English'}</span>
    </Button>
  );
}
