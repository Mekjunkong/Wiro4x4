import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { ShoppingBasket, Package, Shield, Utensils, CheckCircle2, Info } from 'lucide-react';

export function KosherInfo() {
  const { t } = useLanguage();

  const kosherFeatures = [
    {
      icon: ShoppingBasket,
      title: t('Ingredient Sourcing', 'מקור רכיבים'),
      description: t(
        'All ingredients are sourced from certified suppliers and carefully selected for kosher compliance.',
        'כל הרכיבים מקורם מספקים מוסמכים ונבחרים בקפידה לעמידה בכשרות.'
      ),
    },
    {
      icon: Utensils,
      title: t('Meal Preparation', 'הכנת ארוחות'),
      description: t(
        'Meals are prepared in dedicated kosher facilities with strict separation and supervision.',
        'הארוחות מוכנות במתקנים כשרים ייעודיים עם הפרדה ופיקוח קפדניים.'
      ),
    },
    {
      icon: Package,
      title: t('Storage & Packaging', 'אחסון ואריזה'),
      description: t(
        'Sealed packaging and proper storage systems maintain kosher integrity throughout the journey.',
        'אריזה אטומה ומערכות אחסון נכונות שומרות על שלמות הכשרות לאורך המסע.'
      ),
    },
    {
      icon: Shield,
      title: t('Contamination Prevention', 'מניעת זיהום'),
      description: t(
        'Strict protocols ensure no cross-contamination with non-kosher items during transport and serving.',
        'פרוטוקולים קפדניים מבטיחים אי-זיהום צולב עם פריטים לא כשרים במהלך הובלה והגשה.'
      ),
    },
    {
      icon: CheckCircle2,
      title: t('Observance Levels', 'רמות שמירה'),
      description: t(
        'We accommodate different levels of observance - from basic kosher to mehadrin standards.',
        'אנו מתאימים רמות שמירה שונות - מכשרות בסיסית ועד סטנדרטים מהדרין.'
      ),
    },
    {
      icon: Info,
      title: t('Non-Kosher Guests Welcome', 'אורחים לא כשרים מוזמנים'),
      description: t(
        'Our fresh, clean, and disciplined kitchen serves high-quality meals for all dietary preferences.',
        'המטבח הטרי, הנקי והממושמע שלנו מגיש ארוחות איכותיות לכל העדפות תזונתיות.'
      ),
    },
  ];

  return (
    <section id="kosher" className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('Kosher Logistics & Transparency', 'לוגיסטיקת כשרות ושקיפות')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(
              'We take kosher seriously. Here is exactly how we maintain kosher standards throughout your adventure.',
              'אנחנו לוקחים כשרות ברצינות. הנה בדיוק איך אנחנו שומרים על סטנדרטים כשרים לאורך ההרפתקה שלכם.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {kosherFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-premium transition-all duration-300 bg-card"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>


      </div>
    </section>
  );
}
