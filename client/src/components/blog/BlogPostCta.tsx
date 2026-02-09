import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function BlogPostCta() {
  const { t } = useLanguage();

  return (
    <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
      <h3 className="text-2xl font-bold mb-4">
        {t('Ready for Your Adventure?', '\u05DE\u05D5\u05DB\u05E0\u05D9\u05DD \u05DC\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05E9\u05DC\u05DB\u05DD?')}
      </h3>
      <p className="text-muted-foreground mb-6">
        {t(
          'Contact WIRO 4x4 to plan your perfect kosher-friendly off-road experience in Indochina.',
          '\u05E6\u05E8\u05D5 \u05E7\u05E9\u05E8 \u05E2\u05DD WIRO 4x4 \u05DC\u05EA\u05DB\u05E0\u05D5\u05DF \u05D7\u05D5\u05D5\u05D9\u05EA \u05D4\u05E9\u05D8\u05D7 \u05D4\u05DE\u05D5\u05E9\u05DC\u05DE\u05EA \u05D5\u05D4\u05D9\u05D3\u05D9\u05D3\u05D5\u05EA\u05D9\u05EA \u05DC\u05DB\u05E9\u05E8\u05D5\u05EA \u05E9\u05DC\u05DB\u05DD \u05D1\u05D0\u05D9\u05E0\u05D3\u05D5\u05E1\u05D9\u05DF.'
        )}
      </p>
      <Button size="lg" onClick={() => window.open('https://wa.me/66929894495', '_blank')}>
        {t('Contact Us on WhatsApp', '\u05E6\u05E8\u05D5 \u05E7\u05E9\u05E8 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4')}
      </Button>
    </div>
  );
}
