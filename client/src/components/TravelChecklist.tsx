import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import {
  Cloud,
  Shirt,
  Battery,
  Sun,
  Church,
  Utensils,
  Calendar,
  Droplet,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export function TravelChecklist() {
  const { t } = useLanguage();

  const checklistItems = [
    {
      icon: Cloud,
      title: t('Weather', 'מזג אוויר'),
      items: [
        t('Check seasonal conditions (Nov-Feb cool, Mar-May hot, Jun-Oct rainy)', 'בדקו תנאים עונתיים (נוב׳-פבר׳ קריר, מרץ-מאי חם, יוני-אוק׳ גשום)'),
        t('Bring layers for mountain temperature changes', 'הביאו שכבות לשינויי טמפרטורה בהרים'),
      ],
    },
    {
      icon: Shirt,
      title: t('Clothing', 'ביגוד'),
      items: [
        t('Comfortable, breathable outdoor clothing', 'בגדים נוחים ונושמים לחוץ'),
        t('Closed-toe shoes with good grip', 'נעליים סגורות עם אחיזה טובה'),
        t('Hat and sunglasses', 'כובע ומשקפי שמש'),
        t('Light rain jacket (rainy season)', 'ז\'קט גשם קל (עונת גשמים)'),
      ],
    },
    {
      icon: Battery,
      title: t('Power Bank', 'פאוור בנק'),
      items: [
        t('Fully charged power bank for phones and cameras', 'פאוור בנק טעון במלואו לטלפונים ומצלמות'),
        t('Limited charging options on remote trails', 'אפשרויות טעינה מוגבלות בשבילים מרוחקים'),
      ],
    },
    {
      icon: Sun,
      title: t('Sun Protection', 'הגנה מהשמש'),
      items: [
        t('High SPF sunscreen (30+ recommended)', 'קרם הגנה SPF גבוה (30+ מומלץ)'),
        t('Lip balm with SPF', 'שפתון עם SPF'),
        t('Sunglasses with UV protection', 'משקפי שמש עם הגנת UV'),
      ],
    },
    {
      icon: Church,
      title: t('Temple Etiquette', 'נימוסי מקדשים'),
      items: [
        t('Shoulders and knees must be covered', 'כתפיים וברכיים חייבות להיות מכוסות'),
        t('Remove shoes before entering temples', 'הסירו נעליים לפני כניסה למקדשים'),
        t('Respectful behavior and quiet voices', 'התנהגות מכובדת וקולות שקטים'),
      ],
    },
    {
      icon: Utensils,
      title: t('Kosher Instructions', 'הוראות כשרות'),
      items: [
        t('Inform us of your observance level when booking', 'עדכנו אותנו על רמת השמירה שלכם בהזמנה'),
        t('Specify any dietary restrictions or allergies', 'ציינו כל הגבלה תזונתית או אלרגיות'),
        t('Meals can be customized to your needs', 'ארוחות ניתנות להתאמה אישית'),
      ],
    },
    {
      icon: Calendar,
      title: t('Shabbat Timing', 'תזמון שבת'),
      items: [
        t('Tours can be scheduled around Shabbat', 'סיורים ניתנים לתזמון סביב השבת'),
        t('Notify us in advance for Shabbat-friendly itineraries', 'עדכנו אותנו מראש למסלולים ידידותיים לשבת'),
      ],
    },
    {
      icon: Droplet,
      title: t('Water Safety', 'בטיחות מים'),
      items: [
        t('Drink only bottled or purified water', 'שתו רק מים בבקבוקים או מטוהרים'),
        t('We provide water during tours', 'אנחנו מספקים מים במהלך הסיורים'),
        t('Stay hydrated, especially in hot weather', 'הישארו מהודרטים, במיוחד במזג אוויר חם'),
      ],
    },
    {
      icon: Heart,
      title: t('Health Considerations', 'שיקולי בריאות'),
      items: [
        t('Inform us of any medical conditions', 'עדכנו אותנו על כל מצב רפואי'),
        t('Bring personal medications', 'הביאו תרופות אישיות'),
        t('Basic first-aid kit provided on all tours', 'ערכת עזרה ראשונה בסיסית מסופקת בכל הסיורים'),
      ],
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('Before You Travel Checklist', 'רשימת בדיקה לפני הנסיעה')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(
              'Prepare for your adventure with our comprehensive travel checklist.',
              'התכוננו להרפתקה שלכם עם רשימת הבדיקה המקיפה שלנו.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklistItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-premium transition-all duration-300 bg-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <ul className="space-y-2">
                  {item.items.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
