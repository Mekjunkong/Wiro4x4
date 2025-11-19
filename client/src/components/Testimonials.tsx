import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: 'David & Sarah Cohen',
      location: t('Tel Aviv, Israel', 'תל אביב, ישראל'),
      rating: 5,
      text: t(
        'WIRO 4x4 exceeded all expectations! The kosher meals were fresh and delicious, our guide spoke perfect Hebrew, and the waterfalls were absolutely stunning. Highly recommend!',
        'WIRO 4x4 עלו על כל הציפיות! הארוחות הכשרות היו טריות וטעימות, המדריך שלנו דיבר עברית מושלמת, והמפלים היו מדהימים לחלוטין. ממליצים בחום!'
      ),
      lang: 'en',
    },
    {
      name: 'משפחת לוי',
      location: t('Jerusalem, Israel', 'ירושלים, ישראל'),
      rating: 5,
      text: t(
        'Perfect for families! They scheduled our tour to finish before Shabbat, provided mehadrin kosher food, and the kids loved the elephant sanctuary. Professional and caring service.',
        'מושלם למשפחות! הם תזמנו את הסיור שלנו להסתיים לפני שבת, סיפקו אוכל כשר למהדרין, והילדים אהבו את מקלט הפילים. שירות מקצועי ואכפתי.'
      ),
      lang: 'he',
    },
    {
      name: 'Yossi Mizrahi',
      location: t('Haifa, Israel', 'חיפה, ישראל'),
      rating: 5,
      text: t(
        'Best off-road experience in Thailand! Real trails, not tourist traps. The guide knew every hidden spot and the 4x4 vehicles were top quality. Will definitely come back!',
        'חוויית השטח הטובה ביותר בתאילנד! שבילים אמיתיים, לא מלכודות תיירים. המדריך הכיר כל פינה נסתרת והרכבים היו באיכות מעולה. בהחלט נחזור!'
      ),
      lang: 'en',
    },
    {
      name: 'Rachel & Avi Goldstein',
      location: t('Netanya, Israel', 'נתניה, ישראל'),
      rating: 5,
      text: t(
        'The attention to kosher details was impressive. Sealed packaging, dedicated utensils, and they even helped us find a minyan in Chiang Mai. True cultural understanding!',
        'תשומת הלב לפרטי הכשרות הייתה מרשימה. אריזה אטומה, כלים ייעודיים, והם אפילו עזרו לנו למצוא מניין בצ\'יאנג מאי. הבנה תרבותית אמיתית!'
      ),
      lang: 'he',
    },
    {
      name: 'Michael Ben-David',
      location: t('Ramat Gan, Israel', 'רמת גן, ישראל'),
      rating: 5,
      text: t(
        'Incredible rice field landscapes and authentic hill tribe villages. The WhatsApp support was instant and helpful. WIRO 4x4 made our Thailand trip unforgettable!',
        'נופי שדות אורז מדהימים וכפרי שבטי הרים אותנטיים. התמיכה בוואטסאפ הייתה מיידית ומועילה. WIRO 4x4 הפכו את הטיול שלנו לתאילנד לבלתי נשכח!'
      ),
      lang: 'en',
    },
    {
      name: 'שרה ויעקב כהן',
      location: t('Ashdod, Israel', 'אשדוד, ישראל'),
      rating: 5,
      text: t(
        'From booking to the end of the tour, everything was perfect. They understand Israeli travelers and go above and beyond. The jungle expedition was the highlight of our trip!',
        'מההזמנה ועד סוף הסיור, הכל היה מושלם. הם מבינים מטיילים ישראלים ועושים הכל. משלחת הג\'ונגל הייתה שיא הטיול שלנו!'
      ),
      lang: 'he',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('What Our Travelers Say', 'מה המטיילים שלנו אומרים')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(
              'Real experiences from Israeli travelers who explored Northern Thailand with WIRO 4x4.',
              'חוויות אמיתיות של מטיילים ישראלים שחקרו את צפון תאילנד עם WIRO 4x4.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`p-6 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 bg-card ${
                testimonial.lang === 'he' ? 'rtl' : ''
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <Quote className="h-8 w-8 text-primary/20" />
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-secondary text-secondary"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
                  "{testimonial.text}"
                </p>

                <div className={testimonial.lang === 'he' ? 'text-right' : ''}>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
