import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { Calendar, Users, MapPin, Utensils, Hotel, Car, Mountain, Phone, Mail, User, MessageCircle, Check } from 'lucide-react';

const DESTINATIONS = [
  { id: 'pai', en: 'Pai', he: 'פאי' },
  { id: 'chiang-rai', en: 'Chiang Rai', he: "צ'יאנג ראי" },
  { id: 'chiang-mai', en: 'Chiang Mai', he: "צ'יאנג מאי" },
  { id: 'doi-inthanon', en: 'Doi Inthanon', he: 'דוי אינתנון' },
  { id: 'mae-hong-son', en: 'Mae Hong Son', he: 'מאה הונג סון' },
  { id: 'golden-triangle', en: 'Golden Triangle', he: 'המשולש הזהב' },
];

const SHABBAT_HOTELS = [
  { id: 'chabad-chiang-mai', en: 'Chabad Chiang Mai Area', he: "אזור חב\"ד צ'יאנג מאי" },
  { id: 'chabad-bangkok', en: 'Chabad Bangkok Area', he: "אזור חב\"ד בנגקוק" },
  { id: 'other', en: 'Other Location', he: 'מיקום אחר' },
];

const ATTRACTIONS = [
  { id: 'elephant-sanctuary', en: 'Elephant Sanctuary', he: 'שמורת פילים' },
  { id: 'waterfall', en: 'Waterfall Trek', he: 'טיול מפלים' },
  { id: 'hill-tribe', en: 'Hill Tribe Village', he: 'כפר שבטי הרים' },
  { id: 'temple', en: 'Temple Visit', he: 'ביקור במקדש' },
  { id: 'night-market', en: 'Night Market', he: 'שוק לילה' },
  { id: 'hot-springs', en: 'Hot Springs', he: 'מעיינות חמים' },
];

export default function BookingForm() {
  const { language } = useLanguage();
  const isHebrew = language === 'he';
  
  const [formData, setFormData] = useState({
    // Contact
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactWhatsApp: '',
    agentName: '',
    
    // Trip Details
    arrivalDate: '',
    departureDate: '',
    numberOfAdults: 2,
    hasChildren: false,
    numberOfChildren: 0,
    childrenAges: '',
    
    // Services
    includesHotels: false,
    hotelPreferences: '',
    includesGuide: false,
    includesTrip: false,
    includesAttractions: false,
    selectedAttractions: [] as string[],
    includesFood: false,
    foodPreferences: '',
    needsShabbatHotel: false,
    shabbatHotel: '',
    
    // Logistics
    pickupPoint: 'airport',
    customPickupLocation: '',
    dropoffPoint: 'airport',
    customDropoffLocation: '',
    suggestedDestinations: [] as string[],
    
    // Additional
    specialRequests: '',
    budget: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Generate WhatsApp message
      const message = generateWhatsAppMessage();
      window.open(`https://wa.me/66929894495?text=${encodeURIComponent(message)}`, '_blank');
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(isHebrew ? 'שגיאה בשליחת הטופס. נסה שוב.' : 'Error submitting form. Please try again.');
      console.error(error);
    },
  });

  const generateWhatsAppMessage = () => {
    const destinations = formData.suggestedDestinations
      .map(id => DESTINATIONS.find(d => d.id === id)?.[isHebrew ? 'he' : 'en'])
      .filter(Boolean)
      .join(', ');
    
    if (isHebrew) {
      return `🚙 בקשת הזמנה חדשה - WIRO 4x4

👤 שם: ${formData.contactName}
📞 טלפון: ${formData.contactPhone}
📧 אימייל: ${formData.contactEmail}

📅 תאריכים: ${formData.arrivalDate} - ${formData.departureDate}
👥 מבוגרים: ${formData.numberOfAdults}
${formData.hasChildren ? `👶 ילדים: ${formData.numberOfChildren}` : ''}

🗺️ יעדים: ${destinations || 'לא נבחרו'}

שירותים:
${formData.includesHotels ? '✅ מלונות' : ''}
${formData.includesGuide ? '✅ מדריך' : ''}
${formData.includesTrip ? '✅ טיול 4x4' : ''}
${formData.includesAttractions ? '✅ אטרקציות' : ''}
${formData.includesFood ? '✅ אוכל כשר' : ''}
${formData.needsShabbatHotel ? '✅ מלון שבת ליד חב"ד' : ''}

${formData.specialRequests ? `📝 בקשות מיוחדות: ${formData.specialRequests}` : ''}
${formData.agentName ? `🏢 סוכן: ${formData.agentName}` : ''}`;
    } else {
      return `🚙 New Booking Request - WIRO 4x4

👤 Name: ${formData.contactName}
📞 Phone: ${formData.contactPhone}
📧 Email: ${formData.contactEmail}

📅 Dates: ${formData.arrivalDate} - ${formData.departureDate}
👥 Adults: ${formData.numberOfAdults}
${formData.hasChildren ? `👶 Children: ${formData.numberOfChildren}` : ''}

🗺️ Destinations: ${destinations || 'None selected'}

Services:
${formData.includesHotels ? '✅ Hotels' : ''}
${formData.includesGuide ? '✅ Guide' : ''}
${formData.includesTrip ? '✅ 4x4 Trip' : ''}
${formData.includesAttractions ? '✅ Attractions' : ''}
${formData.includesFood ? '✅ Kosher Food' : ''}
${formData.needsShabbatHotel ? '✅ Shabbat Hotel near Chabad' : ''}

${formData.specialRequests ? `📝 Special Requests: ${formData.specialRequests}` : ''}
${formData.agentName ? `🏢 Agent: ${formData.agentName}` : ''}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createBooking.mutateAsync({
        ...formData,
        selectedAttractions: JSON.stringify(formData.selectedAttractions),
        suggestedDestinations: JSON.stringify(formData.suggestedDestinations),
        childrenAges: formData.childrenAges,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDestination = (id: string) => {
    setFormData(prev => ({
      ...prev,
      suggestedDestinations: prev.suggestedDestinations.includes(id)
        ? prev.suggestedDestinations.filter(d => d !== id)
        : [...prev.suggestedDestinations, id]
    }));
  };

  const toggleAttraction = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAttractions: prev.selectedAttractions.includes(id)
        ? prev.selectedAttractions.filter(a => a !== id)
        : [...prev.selectedAttractions, id]
    }));
  };

  if (submitSuccess) {
    return (
      <div className={`min-h-screen ${isHebrew ? 'rtl' : 'ltr'}`} dir={isHebrew ? 'rtl' : 'ltr'}>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">
              {isHebrew ? 'ההזמנה נשלחה בהצלחה!' : 'Booking Submitted Successfully!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isHebrew 
                ? 'תודה על פנייתך! נציג יצור איתך קשר בהקדם. הודעה נשלחה גם לוואטסאפ.'
                : 'Thank you for your inquiry! A representative will contact you soon. A message was also sent to WhatsApp.'}
            </p>
            <a 
              href="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              {isHebrew ? 'חזרה לדף הבית' : 'Back to Home'}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isHebrew ? 'rtl' : 'ltr'}`} dir={isHebrew ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f5a623] to-[#e6951a] py-16 md:py-20 text-center text-white mt-20">
        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 md:mb-4 px-4">
          {isHebrew ? 'טופס הזמנת סיור' : 'Tour Booking Form'}
        </h1>
        <p className="text-lg md:text-xl opacity-90 px-4">
          {isHebrew 
            ? 'טופס קליטה מהירה לשיחות טלפון ופגישות אישיות'
            : 'Quick intake form for phone calls and personal meetings'}
        </p>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl pb-24">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Trip Details Section */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-4 md:mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              {isHebrew ? 'פרטי הטיול' : 'Trip Details'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Number of Adults */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'כמה מבוגרים? *' : 'Number of Adults *'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfAdults}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfAdults: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                  required
                />
              </div>

              {/* Has Children */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasChildren"
                  checked={formData.hasChildren}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasChildren: e.target.checked }))}
                  className="w-6 h-6 md:w-5 md:h-5 rounded border-border text-primary focus:ring-primary touch-manipulation"
                />
                <label htmlFor="hasChildren" className="text-sm font-medium">
                  {isHebrew ? 'יש ילדים' : 'Has Children'}
                </label>
              </div>

              {formData.hasChildren && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isHebrew ? 'מספר ילדים' : 'Number of Children'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.numberOfChildren}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfChildren: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isHebrew ? 'גילאי הילדים' : 'Children Ages'}
                    </label>
                    <input
                      type="text"
                      placeholder={isHebrew ? 'לדוגמה: 5, 8, 12' : 'e.g., 5, 8, 12'}
                      value={formData.childrenAges}
                      onChange={(e) => setFormData(prev => ({ ...prev, childrenAges: e.target.value }))}
                      className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dates & Logistics Section */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-4 md:mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {isHebrew ? 'תאריכים ולוגיסטיקה' : 'Dates & Logistics'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Pickup Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'תאריך איסוף *' : 'Pickup Date *'}
                </label>
                <input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                  required
                />
              </div>

              {/* Pickup Point */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'נקודת איסוף' : 'Pickup Point'}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pickupPoint"
                      value="airport"
                      checked={formData.pickupPoint === 'airport'}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupPoint: e.target.value }))}
                      className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                    />
                    {isHebrew ? 'שדה תעופה' : 'Airport'}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pickupPoint"
                      value="hotel"
                      checked={formData.pickupPoint === 'hotel'}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupPoint: e.target.value }))}
                      className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                    />
                    {isHebrew ? 'מלון' : 'Hotel'}
                  </label>
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'תאריך סיום *' : 'End Date *'}
                </label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                  required
                />
              </div>

              {/* Dropoff Point */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'נקודת הורדה' : 'Dropoff Point'}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dropoffPoint"
                      value="airport"
                      checked={formData.dropoffPoint === 'airport'}
                      onChange={(e) => setFormData(prev => ({ ...prev, dropoffPoint: e.target.value }))}
                      className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                    />
                    {isHebrew ? 'שדה תעופה' : 'Airport'}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dropoffPoint"
                      value="hotel"
                      checked={formData.dropoffPoint === 'hotel'}
                      onChange={(e) => setFormData(prev => ({ ...prev, dropoffPoint: e.target.value }))}
                      className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                    />
                    {isHebrew ? 'מלון' : 'Hotel'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-4 md:mb-6 flex items-center gap-2">
              <Car className="w-6 h-6" />
              {isHebrew ? 'שירותים נדרשים' : 'Required Services'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'includesHotels', icon: Hotel, en: 'Includes Hotels?', he: 'כולל מלונות?' },
                { key: 'includesGuide', icon: User, en: 'Includes Guide?', he: 'כולל מדריך?' },
                { key: 'includesTrip', icon: Car, en: 'Includes 4x4 Trip?', he: 'כולל טיול ונהיגת 4x4?' },
                { key: 'includesAttractions', icon: Mountain, en: 'Includes Attractions?', he: 'כולל אטרקציות בדרך?' },
                { key: 'includesFood', icon: Utensils, en: 'Includes Food (Kosher/Vegan)?', he: 'כולל אוכל: כשר, צמחוני, טבעוני?' },
                { key: 'needsShabbatHotel', icon: Hotel, en: 'Shabbat Hotel near Chabad?', he: 'שבת - צריך מלון ליד חב"ד?' },
              ].map(({ key, icon: Icon, en, he }) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-6 h-6 md:w-5 md:h-5 rounded border-border text-primary focus:ring-primary touch-manipulation"
                  />
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{isHebrew ? he : en}</span>
                </label>
              ))}
            </div>

            {formData.needsShabbatHotel && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'בחר מלון שבת' : 'Select Shabbat Hotel'}
                </label>
                <select
                  value={formData.shabbatHotel}
                  onChange={(e) => setFormData(prev => ({ ...prev, shabbatHotel: e.target.value }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                >
                  <option value="">{isHebrew ? 'בחר...' : 'Select...'}</option>
                  {SHABBAT_HOTELS.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>
                      {isHebrew ? hotel.he : hotel.en}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Destinations Section */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-4 md:mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              {isHebrew ? 'יעדי נסיעה מוצעים למכירה' : 'Suggested Travel Destinations'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DESTINATIONS.map(dest => (
                <label 
                  key={dest.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.suggestedDestinations.includes(dest.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.suggestedDestinations.includes(dest.id)}
                    onChange={() => toggleDestination(dest.id)}
                    className="w-6 h-6 md:w-5 md:h-5 rounded border-border text-primary focus:ring-primary touch-manipulation"
                  />
                  <span className="font-medium">{isHebrew ? dest.he : dest.en}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-4 md:mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              {isHebrew ? 'פרטי לקוח' : 'Customer Details'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'שם לקוח *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  placeholder={isHebrew ? 'שם מלא' : 'Full Name'}
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'מספר טלפון *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  placeholder="+972-XX-XXX-XXXX"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'אימייל' : 'Email'}
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {isHebrew ? 'וואטסאפ' : 'WhatsApp'}
                </label>
                <input
                  type="tel"
                  placeholder="+972-XX-XXX-XXXX"
                  value={formData.contactWhatsApp}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactWhatsApp: e.target.value }))}
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                />
              </div>
            </div>
          </div>

          {/* Agent Section */}
          <div className="bg-card rounded-2xl p-6 shadow-lg border-2 border-dashed border-[#f5a623]/50 bg-[#f5a623]/5">
            <h2 className="text-2xl font-serif font-bold text-[#f5a623] mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              {isHebrew ? 'שם סוכן' : 'Agent Name'}
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {isHebrew ? 'שם הסוכן (אם רלוונטי)' : 'Agent Name (if applicable)'}
              </label>
              <input
                type="text"
                placeholder={isHebrew ? 'השם שלך' : 'Your Name'}
                value={formData.agentName}
                onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-[#f5a623] focus:border-transparent"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-4 md:mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              {isHebrew ? 'בקשות מיוחדות' : 'Special Requests'}
            </h2>
            
            <textarea
              placeholder={isHebrew ? 'הוסף בקשות מיוחדות, הגבלות תזונתיות, או הערות נוספות...' : 'Add special requests, dietary restrictions, or additional notes...'}
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 px-8 rounded-xl font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <MessageCircle className="w-6 h-6" />
            {isSubmitting 
              ? (isHebrew ? 'שולח...' : 'Submitting...')
              : (isHebrew ? 'שלח ושלח לוואטסאפ' : 'Submit & Send to WhatsApp')}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
