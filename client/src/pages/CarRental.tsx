import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Car,
  Shield,
  CreditCard,
  Gauge,
  MapPin,
  MessageCircle,
  CheckCircle,
  Send,
  Star,
  Snowflake,
  Settings2,
  Compass,
} from "lucide-react";

interface RentalCar {
  id: string;
  name: string;
  nameHe: string;
  pricePerDay: number;
  category: [string, string];
  seats: number;
}

const RENTAL_CARS: RentalCar[] = [
  {
    id: "nissan-march",
    name: "Nissan March",
    nameHe: "ניסאן מארץ'",
    pricePerDay: 990,
    category: ["City Compact", "קומפקטית עירונית"],
    seats: 5,
  },
  {
    id: "toyota-vios",
    name: "Toyota Vios",
    nameHe: "טויוטה ויוס",
    pricePerDay: 1190,
    category: ["Comfortable Sedan", "סדאן נוחה"],
    seats: 5,
  },
  {
    id: "toyota-yaris",
    name: "Toyota Yaris",
    nameHe: "טויוטה יאריס",
    pricePerDay: 1190,
    category: ["Compact Hatchback", "האצ'בק קומפקטית"],
    seats: 5,
  },
  {
    id: "toyota-fortuner",
    name: "Toyota Fortuner 4x4",
    nameHe: "טויוטה פורצ'נר 4x4",
    pricePerDay: 2590,
    category: ["Family SUV / 4x4", "רכב שטח משפחתי"],
    seats: 7,
  },
];

const RENTAL_FEATURES = [
  {
    icon: Shield,
    title: ["First-Class Insurance Included", "ביטוח מקיף כלול"],
    desc: [
      "Every rental comes with first-class insurance at no extra cost, so you can explore Northern Thailand with peace of mind.",
      "כל השכרה כוללת ביטוח מקיף ללא עלות נוספת, כדי שתוכלו לטייל בצפון תאילנד בראש שקט.",
    ],
  },
  {
    icon: CreditCard,
    title: ["No Credit Card Required", "ללא צורך בכרטיס אשראי"],
    desc: [
      "Book without a credit card and without prepayment. Confirm first, pay when you pick up the car — THB, USD, EUR and more accepted.",
      "הזמינו ללא כרטיס אשראי וללא תשלום מראש. קבלו אישור קודם ושלמו רק באיסוף הרכב — מקבלים באטים, דולרים, יורו ועוד.",
    ],
  },
  {
    icon: Gauge,
    title: ["Unlimited Mileage", "קילומטראז' ללא הגבלה"],
    desc: [
      "Drive as far as you want — Doi Inthanon, Pai, Chiang Rai, the Mae Hong Son loop. No mileage caps, no surprises.",
      "סעו כמה שתרצו — דוי אינתנון, פאי, צ'יאנג ראי, לולאת מאה הונג סון. בלי הגבלת קילומטרים ובלי הפתעות.",
    ],
  },
  {
    icon: MapPin,
    title: ["Free Hotel & Airport Delivery", "משלוח חינם למלון ולשדה התעופה"],
    desc: [
      "The car is delivered to your hotel or Chiang Mai airport for free, and collected at the end of your rental.",
      "הרכב מגיע אליכם למלון או לשדה התעופה של צ'יאנג מאי בחינם, ונאסף בסיום ההשכרה.",
    ],
  },
  {
    icon: Settings2,
    title: ["New Automatic Cars", "רכבים אוטומטיים חדשים"],
    desc: [
      "All cars are recent models (max 4 years old) with automatic transmission, airbags, and ABS.",
      "כל הרכבים דגמים חדשים (עד 4 שנים) עם תיבת הילוכים אוטומטית, כריות אוויר ו-ABS.",
    ],
  },
  {
    icon: Snowflake,
    title: ["Air-Con & Audio", "מיזוג ומערכת שמע"],
    desc: [
      "Cold air-conditioning and audio with AUX/Bluetooth in every car — essential for Thai road trips.",
      "מיזוג אוויר חזק ומערכת שמע עם AUX/בלוטות' בכל רכב — חובה לטיולי כביש בתאילנד.",
    ],
  },
];

export default function CarRental() {
  const { t, language } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    rentalDates: "",
    carId: RENTAL_CARS[0].id,
    notes: "",
  });

  const selectedCar =
    RENTAL_CARS.find(car => car.id === form.carId) || RENTAL_CARS[0];

  usePageMeta({
    title: "Car Rental Chiang Mai — Self-Drive Cars & 4x4",
    description:
      "Rent a car in Chiang Mai from ฿990/day. No credit card needed, first-class insurance, unlimited mileage, free hotel & airport delivery. Hebrew/English support via our trusted partner.",
    ogTitle: "Car Rental Chiang Mai | WIRO 4x4",
    ogDescription:
      "Self-drive car rental in Chiang Mai from ฿990/day — automatic cars and 4x4 SUVs with insurance included, no credit card required, free delivery.",
    canonicalPath: "/car-rental",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Car Rental in Chiang Mai",
      description:
        "Self-drive car rental in Chiang Mai with first-class insurance, unlimited mileage, free hotel and airport delivery, and Hebrew/English booking support.",
      serviceType: "Car rental",
      areaServed: { "@type": "City", name: "Chiang Mai" },
      provider: {
        "@type": "Organization",
        name: "WIRO 4x4",
        url: "https://www.wiro4x4indochina.com",
      },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "THB",
        lowPrice: 990,
        highPrice: 2590,
        offerCount: RENTAL_CARS.length,
      },
    },
  });

  const whatsappMessage = useMemo(
    () =>
      language === "he"
        ? [
            "שלום WIRO 4x4! אשמח לשכור רכב בצ'יאנג מאי.",
            `רכב: ${selectedCar.nameHe}`,
            `תאריכים: ${form.rentalDates || "__"}`,
            `הערות: ${form.notes || "__"}`,
          ].join("\n")
        : [
            "Hi WIRO 4x4! I'd like to rent a car in Chiang Mai.",
            `Car: ${selectedCar.name}`,
            `Dates: ${form.rentalDates || "__"}`,
            `Notes: ${form.notes || "__"}`,
          ].join("\n"),
    [form, language, selectedCar]
  );

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(
        t(
          "Rental inquiry saved. We'll confirm availability shortly — WhatsApp is fastest.",
          "פניית ההשכרה נשמרה. נאשר זמינות בקרוב — וואטסאפ הכי מהיר."
        )
      );
    },
    onError: () => {
      toast.error(
        t(
          "Something went wrong. Please contact us on WhatsApp instead.",
          "משהו השתבש. אנא צרו קשר בוואטסאפ במקום."
        )
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      newErrors.name = t("Please add your name", "יש להוסיף שם");
    }
    if (!form.email.trim()) {
      newErrors.email = t("Please add your email", "יש להוסיף אימייל");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t("Please enter a valid email", "יש להזין אימייל תקין");
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createLead.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      source: "car-rental",
      interestedTours: `Car rental: ${selectedCar.name}`,
      message: [
        `Car: ${selectedCar.name} (฿${selectedCar.pricePerDay}/day)`,
        form.rentalDates && `Rental dates: ${form.rentalDates}`,
        form.notes && `Notes: ${form.notes}`,
        "Source page: /car-rental (Chiang Mai Wheels partner referral)",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb items={[{ label: t("Car Rental", "השכרת רכב") }]} />
      <main id="main-content">
        {/* Hero */}
        <section className="relative min-h-[50vh] overflow-hidden">
          <OptimizedImage
            src="wiro_fleet_lineup"
            alt={t(
              "Self-drive car rental fleet in Chiang Mai — WIRO 4x4 partner vehicles",
              "צי רכבים להשכרה עצמית בצ'יאנג מאי — רכבי שותף של WIRO 4x4"
            )}
            className="w-full h-full absolute inset-0 object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Car className="w-4 h-4" />
                {t("Self-Drive Car Rental", "השכרת רכב לנהיגה עצמית")}
              </div>
              <h1 className="text-4xl md:text-5xl font-medium text-white mb-4">
                {t("Rent a Car in Chiang Mai", "השכרת רכב בצ'יאנג מאי")}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                {t(
                  "Prefer to explore Northern Thailand at your own pace? Rent a reliable automatic car or 4x4 SUV from ฿990/day through our trusted local rental partner — with Hebrew/English booking support from WIRO 4x4.",
                  "מעדיפים לטייל בצפון תאילנד בקצב שלכם? שכרו רכב אוטומטי אמין או רכב שטח החל מ-990 באט ליום דרך שותף ההשכרה המקומי המהימן שלנו — עם תמיכה בהזמנה בעברית ובאנגלית מ-WIRO 4x4."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="py-8 bg-muted/30 border-b border-border">
          <div className="container max-w-5xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-sm">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent fill-accent" />
                {t(
                  "Partner rated 4.9/5 from 800+ Google reviews",
                  "השותף מדורג 4.9/5 מתוך 800+ ביקורות בגוגל"
                )}
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                {t("Insurance included", "ביטוח כלול")}
              </span>
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                {t("No credit card needed", "ללא כרטיס אשראי")}
              </span>
            </div>
          </div>
        </section>

        {/* Fleet */}
        <section className="py-16 md:py-24">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("Choose Your Wheels", "בחרו את הרכב שלכם")}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "All cars are recent models with automatic transmission, full insurance, and unlimited mileage. Prices are per day.",
                  "כל הרכבים דגמים חדשים עם תיבה אוטומטית, ביטוח מלא וקילומטראז' ללא הגבלה. המחירים ליום."
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RENTAL_CARS.map(car => (
                <Card
                  key={car.id}
                  className={`p-6 rounded-sm border transition-colors cursor-pointer ${
                    form.carId === car.id
                      ? "border-accent shadow-premium"
                      : "border-border hover:border-accent/40"
                  }`}
                  onClick={() => setForm(p => ({ ...p, carId: car.id }))}
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Car className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {t(car.name, car.nameHe)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t(car.category[0], car.category[1])} ·{" "}
                    {t(`${car.seats} seats`, `${car.seats} מושבים`)}
                  </p>
                  <p className="text-accent font-bold text-xl">
                    ฿{car.pricePerDay.toLocaleString()}
                    <span className="text-sm text-muted-foreground font-normal">
                      {" "}
                      {t("/day", "/יום")}
                    </span>
                  </p>
                </Card>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              {t(
                "Vehicle rental is fulfilled by our local partner Chiang Mai Wheels. Monthly and long-term discounts available on request.",
                "השכרת הרכב מתבצעת על ידי השותף המקומי שלנו Chiang Mai Wheels. הנחות לחודש ולטווח ארוך לפי בקשה."
              )}
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-medium mb-3">
                {t("Why Rent Through WIRO 4x4?", "למה לשכור דרך WIRO 4x4?")}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "We connect you with Chiang Mai's most trusted rental service and handle the communication in your language — no hassle, no hidden fees.",
                  "אנחנו מחברים אתכם לשירות ההשכרה האמין ביותר בצ'יאנג מאי ומטפלים בתקשורת בשפה שלכם — בלי כאב ראש ובלי עמלות נסתרות."
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RENTAL_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={idx}
                    className="p-6 rounded-sm border-border hover:border-accent/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t(feature.title[0], feature.title[1])}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(feature.desc[0], feature.desc[1])}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tour + Rental combo */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="text-center mb-10">
              <Compass className="w-10 h-10 text-accent mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-medium mb-4">
                {t(
                  "Combine a Rental with a Guided 4x4 Tour",
                  "שלבו השכרת רכב עם טיול 4x4 מודרך"
                )}
              </h2>
              <GoldDivider />
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                {t(
                  "Many guests rent a car for city days and book a guided off-road tour for the mountain routes that need an experienced driver. Ask us about combo planning — tours, kosher meals, and a rental car in one WhatsApp conversation.",
                  "אורחים רבים שוכרים רכב לימי העיר ומזמינים טיול שטח מודרך למסלולי ההרים שדורשים נהג מנוסה. שאלו אותנו על תכנון משולב — טיולים, ארוחות כשרות ורכב שכור בשיחת וואטסאפ אחת."
                )}
              </p>
            </div>
            <div className="flex justify-center">
              <Link href="/tours">
                <Button size="lg" variant="outline" className="gap-2">
                  {t("Browse Guided Tours", "לכל הטיולים המודרכים")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <section className="py-16 md:py-24 bg-muted/30" id="rental-inquiry">
          <div className="container max-w-3xl">
            {submitted ? (
              <Card className="p-8 text-center border border-accent/30 rounded-2xl shadow-lg bg-card">
                <CheckCircle
                  className="w-12 h-12 text-accent mx-auto mb-4"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold mb-2">
                  {t("Rental Inquiry Saved", "פניית ההשכרה נשמרה")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "We received your details. For the fastest confirmation, send the same request on WhatsApp now.",
                    "קיבלנו את הפרטים. לאישור הכי מהיר, שלחו עכשיו את אותה בקשה בוואטסאפ."
                  )}
                </p>
                <TrackedWhatsAppLink
                  sourceCode={
                    language === "he" ? "CAR-RENTAL-HE" : "CAR-RENTAL-EN"
                  }
                  humanMessage={whatsappMessage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg transition-colors hover:bg-[#20BA5A]"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  {t("Confirm on WhatsApp", "אישור בוואטסאפ")}
                </TrackedWhatsAppLink>
              </Card>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-medium mb-3">
                    {t("Check Car Availability", "בדיקת זמינות רכב")}
                  </h2>
                  <GoldDivider />
                  <p className="text-muted-foreground">
                    {t(
                      "Tell us your dates and preferred car. We confirm availability and final price — no prepayment, no obligation.",
                      "ספרו לנו את התאריכים והרכב המועדף. נאשר זמינות ומחיר סופי — ללא תשלום מראש וללא התחייבות."
                    )}
                  </p>
                </div>
                <Card className="p-6 md:p-8 border border-accent/30 rounded-2xl shadow-lg bg-card">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="rental-car"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Car", "רכב")}
                        </label>
                        <select
                          id="rental-car"
                          value={form.carId}
                          onChange={e =>
                            setForm(p => ({ ...p, carId: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-border bg-input text-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                        >
                          {RENTAL_CARS.map(car => (
                            <option key={car.id} value={car.id}>
                              {t(car.name, car.nameHe)} — ฿
                              {car.pricePerDay.toLocaleString()}
                              {t("/day", "/יום")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="rental-dates"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Rental Dates", "תאריכי השכרה")}
                        </label>
                        <input
                          id="rental-dates"
                          type="text"
                          value={form.rentalDates}
                          onChange={e =>
                            setForm(p => ({
                              ...p,
                              rentalDates: e.target.value,
                            }))
                          }
                          placeholder={t(
                            "e.g. July 10-17",
                            "לדוגמה: 10-17 ביולי"
                          )}
                          className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="rental-name"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Name", "שם")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="rental-name"
                          type="text"
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          value={form.name}
                          onChange={e => {
                            setForm(p => ({ ...p, name: e.target.value }));
                            setErrors(prev => {
                              const { name: _, ...rest } = prev;
                              return rest;
                            });
                          }}
                          placeholder={t("Your name", "השם שלכם")}
                          className={`w-full px-4 py-3 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground ${errors.name ? "border-red-500" : "border-border"}`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1" role="alert">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="rental-email"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Email", "אימייל")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="rental-email"
                          type="email"
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          value={form.email}
                          onChange={e => {
                            setForm(p => ({ ...p, email: e.target.value }));
                            setErrors(prev => {
                              const { email: _, ...rest } = prev;
                              return rest;
                            });
                          }}
                          placeholder="your@email.com"
                          className={`w-full px-4 py-3 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground ${errors.email ? "border-red-500" : "border-border"}`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="rental-phone"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Phone / WhatsApp", "טלפון / וואטסאפ")}
                        </label>
                        <input
                          id="rental-phone"
                          type="tel"
                          value={form.phone}
                          onChange={e =>
                            setForm(p => ({ ...p, phone: e.target.value }))
                          }
                          placeholder="+972..."
                          className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="rental-notes"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Notes", "הערות")}
                        </label>
                        <input
                          id="rental-notes"
                          type="text"
                          value={form.notes}
                          onChange={e =>
                            setForm(p => ({ ...p, notes: e.target.value }))
                          }
                          placeholder={t(
                            "Hotel / airport delivery, child seat...",
                            "משלוח למלון / שדה תעופה, כיסא ילדים..."
                          )}
                          className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full md:w-auto md:px-8 gap-2"
                        disabled={createLead.isPending}
                      >
                        {createLead.isPending ? (
                          <span
                            className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            aria-hidden="true"
                          />
                        ) : (
                          <Send className="w-4 h-4" aria-hidden="true" />
                        )}
                        {createLead.isPending
                          ? t("Sending...", "...שולח")
                          : t("Check Availability", "בדיקת זמינות")}
                      </Button>
                      <TrackedWhatsAppLink
                        sourceCode={
                          language === "he" ? "CAR-RENTAL-HE" : "CAR-RENTAL-EN"
                        }
                        humanMessage={whatsappMessage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#25D366]/60 px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-[#25D366]/10"
                      >
                        <MessageCircle
                          className="h-4 w-4 text-[#25D366]"
                          aria-hidden="true"
                        />
                        {t("Ask on WhatsApp", "שאלו בוואטסאפ")}
                      </TrackedWhatsAppLink>
                    </div>
                  </form>
                </Card>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
