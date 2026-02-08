import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Check, Shield, Users, Calendar, MapPin, MessageSquare, Award, Heart } from 'lucide-react';

export function WhyWiro() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t('First Kosher-Focused Off-Road Company', 'חברת שטח כשרה ראשונה'),
      description: t(
        'The first and only kosher-focused off-road tour company in Chiang Mai',
        'חברת הסיורי שטח הכשרה הראשונה והיחידה בצ\'יאנג מאי'
      ),
    },
    {
      icon: MessageSquare,
      title: t('Hebrew Communication', 'תקשורת בעברית'),
      description: t(
        'Hebrew-speaking guides and support available throughout your journey',
        'מדריכים ותמיכה דוברי עברית לאורך כל המסע'
      ),
    },
    {
      icon: Calendar,
      title: t('Shabbat-Friendly Scheduling', 'תזמון ידידותי לשבת'),
      description: t(
        'Flexible scheduling that respects Shabbat and Jewish holidays',
        'תזמון גמיש שמכבד את השבת והחגים'
      ),
    },
    {
      icon: Users,
      title: t('Private Premium Tours', 'סיורים פרטיים פרימיום'),
      description: t(
        'Exclusive private 4x4 tours tailored to your preferences',
        'סיורי 4x4 פרטיים בלעדיים המותאמים להעדפותיכם'
      ),
    },
    {
      icon: MapPin,
      title: t('Real Off-Road Adventures', 'הרפתקאות שטח אמיתיות'),
      description: t(
        'Authentic trails and hidden gems, not tourist traps',
        'שבילים אותנטיים ואוצרות נסתרים, לא מלכודות תיירים'
      ),
    },
    {
      icon: MessageSquare,
      title: t('Responsive WhatsApp Support', 'תמיכה מהירה בוואטסאפ'),
      description: t(
        'Quick responses and real-time support via WhatsApp',
        'מענה מהיר ותמיכה בזמן אמת דרך וואטסאפ'
      ),
    },
    {
      icon: Shield,
      title: t('Certified Guides', 'מדריכים מוסמכים'),
      description: t(
        'Professional, certified guides with extensive local knowledge',
        'מדריכים מקצועיים ומוסמכים עם ידע מקומי נרחב'
      ),
    },
    {
      icon: Heart,
      title: t('Trusted by Israeli Travelers', 'מהימן על ידי מטיילים ישראלים'),
      description: t(
        'Recommended and trusted by the Israeli travel community',
        'מומלץ ומהימן על ידי קהילת המטיילים הישראלית'
      ),
    },
  ];

  return (
    <section id="why-wiro" className="py-12 md:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            {t('Why Choose WIRO 4x4?', 'למה לבחור ב-WIRO 4x4?')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            {t(
              'We combine authentic off-road adventures with the comfort and cultural understanding that Israeli travelers deserve.',
              'אנחנו משלבים הרפתקאות שטח אותנטיות עם הנוחות וההבנה התרבותית שמגיעה למטיילים ישראלים.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 bg-card"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
