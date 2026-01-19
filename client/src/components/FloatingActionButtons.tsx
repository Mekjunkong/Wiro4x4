import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Calendar } from 'lucide-react';
import { Link } from 'wouter';

export function FloatingActionButtons() {
  const { t } = useLanguage();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      t(
        'Hi WIRO 4x4 – I want to book a Kosher tour.',
        'שלום WIRO 4x4 – אני רוצה להזמין סיור כשר.'
      )
    );
    window.open(`https://wa.me/66819611398?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Book Now Button */}
      <Link href="/book">
        <button
          className="bg-forest-600 hover:bg-forest-700 text-white rounded-full p-4 shadow-premium-lg transition-all duration-300 hover:scale-110 group animate-pulse-subtle"
          aria-label={t('Book Now', 'הזמן עכשיו')}
        >
          <Calendar className="h-6 w-6" />
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {t('Book Now', 'הזמן עכשיו')}
          </span>
        </button>
      </Link>

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-premium-lg transition-all duration-300 hover:scale-110 group animate-pulse-subtle"
        aria-label={t('Contact us on WhatsApp', 'צור קשר בוואטסאפ')}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {t('Chat with us', 'שלח הודעה')}
        </span>
      </button>
    </div>
  );
}
