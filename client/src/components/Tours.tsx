import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mountain, Utensils, Users, Calendar, ArrowRight } from 'lucide-react';

export function Tours() {
  const { t } = useLanguage();

  const tours = [
    {
      id: 1,
      image: '/images/1000000126_compressed.jpg',
      title: t('Waterfall Adventure Tour', 'סיור מפלים והרפתקאות'),
      description: t(
        'Explore hidden waterfalls and jungle trails in premium 4x4 vehicles',
        'חקור מפלים נסתרים ושבילי ג\'ונגל ברכבי 4x4 פרימיום'
      ),
      duration: t('6-8 hours', '6-8 שעות'),
      difficulty: t('Moderate', 'בינוני'),
      kosher: true,
      private: true,
      shabbat: true,
    },
    {
      id: 2,
      image: '/images/vietnam_rice_terraces.jpg',
      title: t('Mountain & Valley Explorer', 'מגלה הרים ועמקים'),
      description: t(
        'Scenic mountain routes with breathtaking valley views and local villages',
        'מסלולי הרים נופיים עם נוף עוצר נשימה של עמקים וכפרים מקומיים'
      ),
      duration: t('Full Day', 'יום שלם'),
      difficulty: t('Easy-Moderate', 'קל-בינוני'),
      kosher: true,
      private: true,
      shabbat: true,
    },
    {
      id: 3,
      image: '/images/laos_jungle.jpg',
      title: t('Jungle & River Expedition', 'משלחת ג\'ונגל ונהר'),
      description: t(
        'Deep jungle exploration with river crossings and natural pools',
        'חקירת ג\'ונגל עמוקה עם חציית נהרות ובריכות טבעיות'
      ),
      duration: t('8-10 hours', '8-10 שעות'),
      difficulty: t('Challenging', 'מאתגר'),
      kosher: true,
      private: true,
      shabbat: false,
    },
    {
      id: 4,
      image: '/images/1000000149.jpg',
      title: t('Rice Fields & Culture Tour', 'סיור שדות אורז ותרבות'),
      description: t(
        'Experience traditional Thai culture, rice terraces, and local communities',
        'חוו תרבות תאילנדית מסורתית, מדרגות אורז וקהילות מקומיות'
      ),
      duration: t('4-6 hours', '4-6 שעות'),
      difficulty: t('Easy', 'קל'),
      kosher: true,
      private: true,
      shabbat: true,
    },
    {
      id: 5,
      image: '/images/1000000140.jpg',
      title: t('Elephant Sanctuary Visit', 'ביקור במקלט פילים'),
      description: t(
        'Ethical elephant interaction and care experience in natural habitat',
        'אינטראקציה אתית עם פילים וחוויית טיפול בסביבה טבעית'
      ),
      duration: t('Half Day', 'חצי יום'),
      difficulty: t('Easy', 'קל'),
      kosher: true,
      private: true,
      shabbat: true,
    },
    {
      id: 6,
      image: '/images/1000000135.jpg',
      title: t('Hill Tribe Cultural Journey', 'מסע תרבותי לשבטי ההרים'),
      description: t(
        'Visit authentic hill tribe villages and learn about local traditions',
        'בקרו בכפרי שבטי הרים אותנטיים ולמדו על מסורות מקומיות'
      ),
      duration: t('6-8 hours', '6-8 שעות'),
      difficulty: t('Moderate', 'בינוני'),
      kosher: true,
      private: true,
      shabbat: true,
    },
  ];

  const handleBookTour = () => {
    const message = encodeURIComponent(
      t(
        'Hi WIRO 4x4 – I want to book a tour.',
        'שלום WIRO 4x4 – אני רוצה להזמין סיור.'
      )
    );
    window.open(`https://wa.me/66123456789?text=${message}`, '_blank');
  };

  return (
    <section id="tours" className="py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('Our Premium Tours', 'הסיורים הפרימיום שלנו')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(
              'Choose from our carefully curated selection of kosher-friendly off-road adventures.',
              'בחרו מהמבחר שלנו של הרפתקאות שטח ידידותיות לכשרות.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <Card
              key={tour.id}
              className="overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{tour.title}</h3>
                <p className="text-sm text-muted-foreground">{tour.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-primary" />
                    <span>{tour.difficulty}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {tour.kosher && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      <Utensils className="h-3 w-3" />
                      {t('Kosher', 'כשר')}
                    </span>
                  )}
                  {tour.private && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary-foreground text-xs rounded-full">
                      <Users className="h-3 w-3" />
                      {t('Private', 'פרטי')}
                    </span>
                  )}
                  {tour.shabbat && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent-foreground text-xs rounded-full">
                      <Calendar className="h-3 w-3" />
                      {t('Shabbat OK', 'שבת אפשרי')}
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleBookTour}
                  className="w-full gap-2 mt-4"
                  variant="default"
                >
                  {t('Book Now', 'הזמן עכשיו')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
