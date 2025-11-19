import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Heart, MapPin } from 'lucide-react';

export function CommunityConnection() {
  const { t } = useLanguage();

  const communities = [
    { city: t('Chiang Mai', 'צ\'יאנג מאי'), country: t('Thailand', 'תאילנד') },
    { city: t('Phuket', 'פוקט'), country: t('Thailand', 'תאילנד') },
    { city: t('Bangkok', 'בנגקוק'), country: t('Thailand', 'תאילנד') },
    { city: t('Hanoi', 'האנוי'), country: t('Vietnam', 'וייטנאם') },
    { city: t('Saigon', 'סייגון'), country: t('Vietnam', 'וייטנאם') },
    { city: t('Vientiane', 'ויאנטיאן'), country: t('Laos', 'לאוס') },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <Card className="p-8 md:p-12 bg-card shadow-premium-lg">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              {t('Community Connection', 'קשר קהילתי')}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <p className="text-lg leading-relaxed">
              {t(
                'We maintain long-standing friendships with Chabad communities across Chiang Mai, Phuket, Bangkok, Hanoi, Saigon, and Vientiane. These relationships help us support Israeli travelers with cultural understanding and local knowledge.',
                'יש לנו קשרים חמים עם קהילות חב״ד בצ\'יאנג מאי, פוקט, בנגקוק, האנוי, סייגון וויאנטיאן. הקשרים האלו מאפשרים לנו ללוות מטיילים ישראלים ברגישות ובהיכרות עמוקה עם הצרכים שלהם.'
              )}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
              {communities.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center gap-2 p-3 bg-background rounded-lg"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-semibold">{location.city}</div>
                    <div className="text-muted-foreground text-xs">{location.country}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground italic pt-4">
              {t(
                '* These are personal friendships and community connections. WIRO 4x4 is not officially affiliated with or endorsed by any Chabad organization.',
                '* אלו קשרים אישיים וקהילתיים. WIRO 4x4 אינה מסונפת רשמית או מאושרת על ידי ארגון חב״ד כלשהו.'
              )}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
