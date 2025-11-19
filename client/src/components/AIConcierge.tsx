import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Calendar, DollarSign, Cloud, MapPin, Sparkles, Utensils } from 'lucide-react';
import { toast } from 'sonner';

export function AIConcierge() {
  const { t } = useLanguage();

  const capabilities = [
    {
      icon: MessageSquare,
      title: t('Hebrew + English', 'עברית + אנגלית'),
      description: t('Fluent in both languages', 'שולט בשתי השפות'),
    },
    {
      icon: DollarSign,
      title: t('Instant Quotation', 'הצעת מחיר מיידית'),
      description: t('Get pricing immediately', 'קבלו מחיר מיד'),
    },
    {
      icon: Calendar,
      title: t('Automatic Booking', 'הזמנה אוטומטית'),
      description: t('Book tours instantly', 'הזמינו סיורים מיד'),
    },
    {
      icon: Utensils,
      title: t('Kosher-Aware Planning', 'תכנון מודע כשרות'),
      description: t('Understands kosher needs', 'מבין צרכי כשרות'),
    },
    {
      icon: Calendar,
      title: t('Shabbat-Friendly', 'ידידותי לשבת'),
      description: t('Respects Shabbat timing', 'מכבד זמני שבת'),
    },
    {
      icon: Cloud,
      title: t('Weather Alerts', 'התראות מזג אוויר'),
      description: t('Real-time weather updates', 'עדכוני מזג אוויר בזמן אמת'),
    },
    {
      icon: MessageSquare,
      title: t('WhatsApp Integration', 'שילוב וואטסאפ'),
      description: t('Sends messages directly', 'שולח הודעות ישירות'),
    },
    {
      icon: MapPin,
      title: t('Route Suggestions', 'הצעות מסלולים'),
      description: t('Tailored to your interests', 'מותאם לתחומי העניין שלכם'),
    },
  ];

  const handleAskAI = () => {
    toast.info(
      t(
        'AI Concierge coming soon! For now, please contact us via WhatsApp.',
        'הקונסיירז׳ החכם בקרוב! בינתיים, אנא צרו קשר דרך וואטסאפ.'
      )
    );
  };

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Bot className="h-12 w-12 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold">
              {t('AI Trip Concierge', 'הקונסיירז׳ החכם שלכם')}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground">
            {t(
              'Our intelligent AI assistant helps you plan, book, and optimize your Chiang Mai adventure in Hebrew or English.',
              'העוזר החכם שלנו עוזר לכם לתכנן, להזמין ולייעל את ההרפתקה שלכם בצ\'יאנג מאי בעברית או אנגלית.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <Card
                key={index}
                className="p-4 text-center hover:shadow-premium transition-all duration-300 hover:-translate-y-1 bg-card"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">{capability.title}</h3>
                  <p className="text-xs text-muted-foreground">{capability.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-premium-lg">
            <div className="text-center space-y-6">
              <Sparkles className="h-16 w-16 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">
                {t('Coming Soon', 'בקרוב')}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  'Our AI Concierge is currently in development. In the meantime, our team is ready to assist you via WhatsApp with the same level of personalized service.',
                  'הקונסיירז׳ החכם שלנו נמצא כעת בפיתוח. בינתיים, הצוות שלנו מוכן לסייע לכם דרך וואטסאפ עם אותה רמת שירות אישי.'
                )}
              </p>
              <Button
                onClick={handleAskAI}
                size="lg"
                className="gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                {t('Contact Us on WhatsApp', 'צרו קשר בוואטסאפ')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
