import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users, Clock, Utensils, Car, Shield, Calendar, MessageCircle } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const HARDCODED_TOURS = [
  {
    id: 1,
    name: 'Waterfall Adventure Tour',
    nameHe: 'סיור מפלים והרפתקאות',
    duration: '6-8 hours',
    durationHe: '6-8 שעות',
    basePrice: 3500,
    image: '/images/1000000126_compressed.jpg',
    included: [
      { en: 'Private 4x4 vehicle with driver', he: 'רכב 4x4 פרטי עם נהג' },
      { en: 'Hebrew-speaking guide', he: 'מדריך דובר עברית' },
      { en: 'Kosher packed lunch', he: 'ארוחת צהריים כשרה ארוזה' },
      { en: 'Water and snacks', he: 'מים וחטיפים' },
      { en: 'Entrance fees', he: 'דמי כניסה' },
      { en: 'Insurance coverage', he: 'כיסוי ביטוחי' },
    ],
  },
  {
    id: 2,
    name: 'Mountain & Valley Explorer',
    nameHe: 'מגלה הרים ועמקים',
    duration: 'Full Day (8-10 hours)',
    durationHe: 'יום שלם (8-10 שעות)',
    basePrice: 4200,
    image: '/images/vietnam_rice_terraces.jpg',
    included: [
      { en: 'Private 4x4 vehicle with driver', he: 'רכב 4x4 פרטי עם נהג' },
      { en: 'Hebrew-speaking guide', he: 'מדריך דובר עברית' },
      { en: 'Kosher lunch at local restaurant', he: 'ארוחת צהריים כשרה במסעדה מקומית' },
      { en: 'Water and refreshments', he: 'מים ומשקאות' },
      { en: 'All entrance fees', he: 'כל דמי הכניסה' },
      { en: 'Photo stops at scenic viewpoints', he: 'עצירות צילום בנקודות תצפית' },
    ],
  },
  {
    id: 3,
    name: 'Jungle & River Expedition',
    nameHe: 'משלחת ג\'ונגל ונהר',
    duration: '8-10 hours',
    durationHe: '8-10 שעות',
    basePrice: 4800,
    image: '/images/laos_jungle.jpg',
    included: [
      { en: 'Private 4x4 vehicle with experienced driver', he: 'רכב 4x4 פרטי עם נהג מנוסה' },
      { en: 'Hebrew-speaking adventure guide', he: 'מדריך הרפתקאות דובר עברית' },
      { en: 'Kosher meals and snacks', he: 'ארוחות וחטיפים כשרים' },
      { en: 'Safety equipment', he: 'ציוד בטיחות' },
      { en: 'First aid kit', he: 'ערכת עזרה ראשונה' },
      { en: 'Waterproof bags for belongings', he: 'תיקים עמידים במים' },
    ],
  },
  {
    id: 4,
    name: 'Rice Fields & Culture Tour',
    nameHe: 'סיור שדות אורז ותרבות',
    duration: '4-6 hours',
    durationHe: '4-6 שעות',
    basePrice: 2800,
    image: '/images/1000000149.jpg',
    included: [
      { en: 'Private vehicle with driver', he: 'רכב פרטי עם נהג' },
      { en: 'Hebrew-speaking cultural guide', he: 'מדריך תרבות דובר עברית' },
      { en: 'Light kosher refreshments', he: 'כיבוד קל כשר' },
      { en: 'Village visit permissions', he: 'אישורי ביקור בכפרים' },
      { en: 'Cultural interaction opportunities', he: 'הזדמנויות לאינטראקציה תרבותית' },
    ],
  },
  {
    id: 5,
    name: 'Elephant Sanctuary Visit',
    nameHe: 'ביקור במקלט פילים',
    duration: 'Half Day (4-5 hours)',
    durationHe: 'חצי יום (4-5 שעות)',
    basePrice: 3200,
    image: '/images/1000000140.jpg',
    included: [
      { en: 'Private transportation', he: 'הסעה פרטית' },
      { en: 'Hebrew-speaking guide', he: 'מדריך דובר עברית' },
      { en: 'Sanctuary entrance and activities', he: 'כניסה ופעילויות במקלט' },
      { en: 'Kosher snacks', he: 'חטיפים כשרים' },
      { en: 'Ethical elephant interaction', he: 'אינטראקציה אתית עם פילים' },
    ],
  },
  {
    id: 6,
    name: 'Hill Tribe Cultural Journey',
    nameHe: 'מסע תרבותי לשבטי ההרים',
    duration: '6-8 hours',
    durationHe: '6-8 שעות',
    basePrice: 3800,
    image: '/images/1000000135.jpg',
    included: [
      { en: 'Private 4x4 vehicle', he: 'רכב 4x4 פרטי' },
      { en: 'Hebrew-speaking cultural guide', he: 'מדריך תרבות דובר עברית' },
      { en: 'Kosher packed lunch', he: 'ארוחת צהריים כשרה ארוזה' },
      { en: 'Village visit permissions', he: 'אישורי ביקור בכפרים' },
      { en: 'Cultural gifts for communities', he: 'מתנות תרבותיות לקהילות' },
    ],
  },
];

export default function Pricing() {
  const { t } = useLanguage();
  usePageMeta('Tour Pricing', 'Transparent pricing for WIRO 4x4 kosher off-road tours in Chiang Mai. Private vehicle, Hebrew guide, kosher meals included.');
  const { data: dbTours } = trpc.tour.list.useQuery();

  const tours = dbTours && dbTours.length > 0
    ? dbTours.map(tour => {
        const highlights: string[] = tour.highlights ? JSON.parse(tour.highlights) : [];
        const highlightsHe: string[] = tour.highlightsHe ? JSON.parse(tour.highlightsHe) : [];
        const included = highlights.map((h, i) => t(h, highlightsHe[i] || h));
        return {
          id: tour.id,
          name: t(tour.name, tour.nameHe),
          duration: tour.duration,
          basePrice: tour.price,
          image: tour.imageUrl,
          included,
        };
      })
    : HARDCODED_TOURS.map(tour => ({
        id: tour.id,
        name: t(tour.name, tour.nameHe),
        duration: t(tour.duration, tour.durationHe),
        basePrice: tour.basePrice,
        image: tour.image,
        included: tour.included.map(item => t(item.en, item.he)),
      }));

  const packages = [
    {
      name: t('3-Day Indochina Explorer', 'חוקר אינדוסין 3 ימים'),
      days: 3,
      price: 11500,
      savings: 1200,
      tours: [
        t('Waterfall Adventure', 'הרפתקת מפלים'),
        t('Mountain & Valley Explorer', 'מגלה הרים ועמקים'),
        t('Jungle & River Expedition', 'משלחת ג\'ונגל ונהר'),
      ],
    },
    {
      name: t('5-Day Complete Experience', 'חוויה מלאה 5 ימים'),
      days: 5,
      price: 17800,
      savings: 2400,
      tours: [
        t('All 6 tours included', 'כל 6 הסיורים כלולים'),
        t('Flexible scheduling', 'תזמון גמיש'),
        t('Priority booking', 'הזמנה מועדפת'),
      ],
    },
    {
      name: t('Weekend Adventure', 'הרפתקת סוף שבוע'),
      days: 2,
      price: 7200,
      savings: 800,
      tours: [
        t('Rice Fields & Culture', 'שדות אורז ותרבות'),
        t('Elephant Sanctuary', 'מקלט פילים'),
        t('Waterfall Adventure', 'הרפתקת מפלים'),
      ],
    },
  ];

  const handleWhatsAppInquiry = (tourName: string, price: number) => {
    const message = encodeURIComponent(
      t(
        `Hi WIRO 4x4! I'm interested in the ${tourName} (${price} THB). Can you provide more details?`,
        `שלום WIRO 4x4! אני מעוניין ב${tourName} (${price} ฿). האם תוכלו לספק פרטים נוספים?`
      )
    );
    window.open(`https://wa.me/66929894495?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('Transparent Pricing', 'תמחור שקוף')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t(
                'All prices include private vehicle, Hebrew-speaking guide, kosher meals, and insurance. No hidden fees.',
                'כל המחירים כוללים רכב פרטי, מדריך דובר עברית, ארוחות כשרות וביטוח. ללא עלויות נסתרות.'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>{t('Fully Insured', 'מבוטח במלואו')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{t('Flexible Dates', 'תאריכים גמישים')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <span>{t('Kosher Meals', 'ארוחות כשרות')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Tours Pricing */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('Individual Tours', 'סיורים בודדים')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-premium-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{tour.duration}</span>
                    </div>
                  </div>

                  <div className="border-t border-b py-4">
                    <div className="text-3xl font-bold text-primary mb-1">
                      ฿{tour.basePrice.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('Per group (1-4 people)', 'לקבוצה (1-4 אנשים)')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">
                      {t('What\'s Included:', 'מה כלול:')}
                    </p>
                    <ul className="space-y-1">
                      {tour.included.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {tour.included.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        {t(`+ ${tour.included.length - 3} more inclusions`, `+ ${tour.included.length - 3} פריטים נוספים`)}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleWhatsAppInquiry(tour.name, tour.basePrice)}
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('Book via WhatsApp', 'הזמן בוואטסאפ')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Group Size Pricing */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                {t('Group Size Pricing', 'תמחור לפי גודל קבוצה')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold">1-2 {t('people', 'אנשים')}</div>
                  <div className="text-sm text-muted-foreground">{t('Base price', 'מחיר בסיס')}</div>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold">3-4 {t('people', 'אנשים')}</div>
                  <div className="text-sm text-muted-foreground">{t('Same price', 'אותו מחיר')}</div>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold">5-6 {t('people', 'אנשים')}</div>
                  <div className="text-sm text-muted-foreground">{t('+20%', '+20%')}</div>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-bold">7+ {t('people', 'אנשים')}</div>
                  <div className="text-sm text-muted-foreground">{t('Custom quote', 'הצעת מחיר')}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Multi-Day Packages */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('Multi-Day Packages', 'חבילות מרובות ימים')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('Save up to 20% with our curated multi-day adventures', 'חסכו עד 20% עם חבילות ההרפתקאות שלנו')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, idx) => (
              <Card key={idx} className="p-8 hover:shadow-premium-lg transition-all duration-300 relative overflow-hidden">
                {pkg.savings > 0 && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    {t('Save', 'חסכו')} ฿{pkg.savings}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="text-sm text-muted-foreground mb-4">
                    {pkg.days} {t('Days', 'ימים')}
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    ฿{pkg.price.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('Per group', 'לקבוצה')}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.tours.map((tour, tourIdx) => (
                    <li key={tourIdx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{tour}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleWhatsAppInquiry(pkg.name, pkg.price)}
                  className="w-full"
                  variant={idx === 1 ? 'default' : 'outline'}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('Inquire Now', 'פנה עכשיו')}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6">
              {t('Booking Terms & Policies', 'תנאי הזמנה ומדיניות')}
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-2">{t('Payment', 'תשלום')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t(
                    '50% deposit required to confirm booking. Balance due on tour day. We accept cash (THB, USD, EUR) and bank transfer.',
                    'נדרש מקדמה של 50% לאישור ההזמנה. יתרת התשלום ביום הסיור. אנו מקבלים מזומן (THB, USD, EUR) והעברה בנקאית.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-2">{t('Cancellation Policy', 'מדיניות ביטול')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('7+ days before: Full refund', '7+ ימים לפני: החזר מלא')}</li>
                  <li>• {t('3-6 days before: 50% refund', '3-6 ימים לפני: החזר 50%')}</li>
                  <li>• {t('Less than 3 days: No refund', 'פחות מ-3 ימים: ללא החזר')}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">{t('What to Bring', 'מה להביא')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'Comfortable clothes, closed-toe shoes, sunscreen, hat, camera, and personal medications.',
                    'בגדים נוחים, נעליים סגורות, קרם הגנה, כובע, מצלמה ותרופות אישיות.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-2">{t('Weather Policy', 'מדיניות מזג אוויר')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'Tours operate rain or shine. In case of severe weather, we will reschedule or offer full refund.',
                    'הסיורים פועלים בכל מזג אוויר. במקרה של מזג אוויר קיצוני, נקבע מועד חלופי או נחזיר את התשלום במלואו.'
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
