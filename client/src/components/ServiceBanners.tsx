import { useEffect, useState } from "react";
import { ContactOptions } from "@/components/ContactOptions";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { getServiceCoverFlowPosition } from "@/lib/serviceCoverFlow";

const services = [
  {
    id: "organized-groups",
    summary: "Tailor-made journeys across Thailand and East Asia.",
    he: {
      label: "טיולים מאורגנים וקבוצות",
      audience: "לסוכני נסיעות ולחברות",
      heading: "טיולים בהתאמה אישית — מתאילנד ועד מזרח אסיה",
      subheading:
        "25 שנות ניסיון בתכנון ובהפקת טיולים בשטח עבור סוכני נסיעות וחברות מישראל. שירות מקצה לקצה.",
      bullets: [
        "מסלולים בהתאמה אישית בתאילנד, וייטנאם, לאוס, יפן, קמבודיה והודו",
        "תיאום טיסות, מלונות ואוכל כשר; אפשרות לשף פרטי",
        "מדריכים דוברי עברית ואנגלית לאורך הטיול",
        "ליווי צמוד למארגן הקבוצה, מהתכנון ועד החזרה הביתה",
      ],
      cta: "בואו נתכנן טיול לקבוצה שלכם",
      summary: "מסעות בהתאמה אישית בתאילנד ובמזרח אסיה.",
      alt: "קבוצת מטיילים לצד רכב שטח של WIRO בשביל ביער",
    },
    label: "Organized trips & groups",
    audience: "For travel agents and companies",
    heading: "Fully customized group trips — from Thailand to all of East Asia",
    subheading:
      "25 years of experience building and executing tour plans on the ground for travel agents and companies from Israel. End-to-end service.",
    bullets: [
      "Customized itineraries in Thailand, Vietnam, Laos, Japan, Cambodia and India",
      "Flights, hotels and kosher food coordinated; private chef option available",
      "Hebrew and English speaking guides throughout the trip",
      "Close support for the organizer, from planning to return home",
    ],
    cta: "Let's customize a trip for your group",
    href: "/contact?subject=group_booking",
    image: "tour_group_photo.webp",
    alt: "WIRO group standing beside a 4x4 on a forest trail",
  },
  {
    id: "private-tours",
    summary: "Your people. Your pace. A route made just for you.",
    he: {
      label: "הטיול הפרטי שלכם",
      audience: "ברכב שטח או בוואן",
      heading: "טיולים פרטיים ברכב שטח או בוואן, בהתאמה אישית",
      subheading: "אותנטי, אתגרי, רגוע, נסתר או מלא הרפתקאות? אתם מחליטים.",
      bullets: [
        "כל טיול מתוכנן אישית — אין שני טיולים זהים",
        "רכב פרטי עם נהג, או אפשרות לנהיגה עצמית",
        "אפשרות לשף פרטי ואוכל כשר לאורך המסלול",
        "מלונות, קצב ופעילויות שמתאימים למשפחה או לקבוצה שלכם",
      ],
      cta: "בואו נתכנן את הטיול הפרטי שלכם",
      summary: "האנשים שלכם. הקצב שלכם. מסלול שנבנה בשבילכם.",
      alt: "זוג לצד רכב שטח פרטי של WIRO בהרים",
    },
    label: "Your Private Tours",
    audience: "4x4 or van, fully customized",
    heading: "Private 4x4 or van tours, fully customized to you",
    subheading: "Authentic, extreme, relaxed, hidden, adventurous? You decide.",
    bullets: [
      "Every trip is personally planned — no two trips are the same",
      "Private vehicle with a driver, or the option to drive independently",
      "Private chef option and kosher food throughout the route",
      "Hotels, pace and activities to match your family or group",
    ],
    cta: "Plan your own private trip",
    href: "/tours",
    image: "couple_with_4x4.webp",
    alt: "A couple beside their private WIRO 4x4 in the mountains",
  },
  {
    id: "motorcycle-tours",
    summary: "Winding mountain roads. Open skies. Ride together.",
    he: {
      label: "טיולי אופנועים בצפון",
      audience: "לקבוצות של 5 רוכבים ומעלה",
      heading:
        "כבישי הרכיבה היפים בעולם — בהרי צפון תאילנד, עם קבוצת הרוכבים שלכם",
      subheading:
        "טיולי אופנועים מאורגנים בצפון תאילנד לקבוצות של 5 רוכבים ומעלה.",
      bullets: [
        "מסלול אגדי עם 1,864 פיתולים, יערות גשם, טרסות אורז, כפרים ומפלים",
        "מלונות נבחרים המותאמים לקבוצות רוכבים",
        "ליווי צמוד לאורך הדרך, כולל רכב תמיכה לציוד",
        "לבחירתכם: שף פרטי, תפריט כשר, שיעורי רכיבה, ציוד ומדריך רכיבה מקצועי",
      ],
      cta: "אתם מביאים קבוצה — אנחנו מתכננים מסלול",
      summary: "כבישים מתפתלים, שמיים פתוחים וחוויית רכיבה משותפת.",
      alt: "המחשה של רוכבי אופנועים בכביש הררי בצפון תאילנד",
    },
    label: "Motorcycle Tours in the North",
    audience: "For groups, minimum 5 riders",
    heading:
      "The most beautiful riding roads in the world — Northern Thailand's mountains, for a real group of riders",
    subheading:
      "Organized motorcycle tours in Northern Thailand for groups (minimum 5 riders).",
    bullets: [
      "An iconic loop with 1,864 turns, rainforests, rice terraces, villages and waterfalls",
      "Selected hotels adapted for groups of 5+ riders",
      "Close escort throughout, with a support vehicle for equipment",
      "Optional chef, kosher menu, riding lessons, equipment and professional riding guide",
    ],
    cta: "Assemble a group — we'll plan the route",
    href: "/motorcycle-tours",
    // AI-generated service illustration; not a photograph of WIRO guests.
    image: "motorcycle-touring-illustration.webp",
    alt: "Illustration of motorcycle riders touring a mountain road in Northern Thailand",
  },
  {
    id: "off-road",
    summary: "Beyond the paved road, into the heart of the North.",
    he: {
      label: "חוויית שטח אמיתית",
      audience: "לזוגות, למשפחות ולקבוצות",
      heading: "טיול שטח אמיתי בלב הצפון — עם ההגה בידיים שלכם או בלעדיו",
      subheading:
        "מסלולי שטח לזוגות, למשפחות ולקבוצות, עם אפשרות מיוחדת לנהיגה עצמית.",
      bullets: [
        "25 שנות ניסיון בתכנון מסלולי שטח בצפון — פאי, צ׳יאנג ראי, דוי אינתנון ועוד",
        "רכבי שטח לנהיגה עצמית עם ליווי צמוד",
        "אפשרות לשף פרטי, מלונות ותפריט כשר לאורך המסלול",
        "כל התכנון עלינו — אתם רק מביאים את האדרנלין",
      ],
      cta: "בואו נתכנן טיול שטח אמיתי בצפון",
      summary: "מעבר לכביש הסלול, אל הלב הפראי של הצפון.",
      alt: "רכב שטח של WIRO חוצה מים בשביל יער",
    },
    label: "True Off-Road Experience",
    audience: "For families or groups, with a self-drive 4x4 option",
    heading:
      "A real off-road trip in the heart of the North — with or without a steering wheel in your hands",
    subheading:
      "4x4 routes for couples, families and groups, with an exclusive self-driving option.",
    bullets: [
      "25 years planning northern off-road routes — Pai, Chiang Rai, Doi Inthanon and more",
      "Self-drive 4x4 vehicles with close escort",
      "Private chef option, hotels and a kosher menu along the route",
      "All the planning is on us — just bring the adrenaline",
    ],
    cta: "Plan a real 4x4 trip in the North",
    href: "/tours",
    image: "offroad_trail_driving.webp",
    alt: "WIRO 4x4 splashing through water on a rugged forest trail",
  },
  {
    id: "car-rental",
    summary: "Pick up the keys. Discover the North at your own pace.",
    he: {
      label: "השכרת רכב בצ׳יאנג מאי",
      audience: "לגלות את הצפון בקצב שלכם",
      heading: "השכרת רכב בצפון — חופש לנוע בקצב שלכם",
      subheading:
        "השכרת רכב לטיולים עצמאיים בצפון תאילנד, עם שירות, תחזוקה, אמינות ויושרה.",
      bullets: [
        "מגוון רכבים להשכרה עצמאית באזור הצפון",
        "הזמנה נוחה באינטרנט",
        "אפשרות להתייעץ עם הצוות שלנו על המסלול",
        "גיבוי וזמינות לאורך תקופת ההשכרה",
      ],
      cta: "להזמנת רכב",
      summary: "המפתחות אצלכם. הצפון מחכה שתגלו אותו.",
      alt: "צוות WIRO לצד שורת רכבים בסביבה ירוקה",
    },
    label: "Car Rental in Chiang Mai",
    audience: "Travel in your own flow",
    heading: "Car rental in the North — move freely, at your own pace",
    subheading:
      "Private car rental for independent trips in Northern Thailand — service, maintenance, reliability and integrity guaranteed.",
    bullets: [
      "A range of vehicles for independent rental in the northern region",
      "Convenient online booking",
      "Consult our team on your itinerary",
      "Backup and availability throughout your rental",
    ],
    cta: "Book a car",
    href: "/car-rental",
    image: "vehicle_fleet_jungle.webp",
    alt: "WIRO team with a lineup of vehicles in a green forest setting",
  },
];

export function ServiceBanners() {
  const { language, t } = useLanguage();
  const rtl = language === "he";
  const [api, setApi] = useState<CarouselApi>();
  const [position, setPosition] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  useEffect(() => {
    if (!api) return;
    const update = () => {
      setPosition(api.selectedScrollSnap());
      setSnaps(api.scrollSnapList());
      setCanPrevious(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);
  const jump = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const Forward = rtl ? ArrowLeft : ArrowRight;
  const Back = rtl ? ArrowRight : ArrowLeft;
  return (
    <section
      id="services"
      lang={language}
      dir={rtl ? "rtl" : "ltr"}
      aria-labelledby="services-heading"
      className="bg-background py-16 md:py-24"
    >
      <div className="container">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("The WIRO way", "הדרך של WIRO")}
          </p>
          <h2
            id="services-heading"
            className="text-3xl font-semibold md:text-4xl"
          >
            {t("Your journey, your way", "המסע שלכם, בדרך שלכם")}
          </h2>
          <div
            className="mx-auto my-5 h-px w-12 bg-accent"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t(
              "Private adventures. Shared discoveries. Five ways to make the North your own.",
              "הרפתקאות פרטיות, חוויות משותפות. חמש דרכים לגלות את הצפון בדרך שלכם."
            )}
          </p>
        </div>
        <Carousel
          key={language}
          setApi={setApi}
          opts={{
            align: "center",
            direction: rtl ? "rtl" : "ltr",
            loop: true,
            slidesToScroll: 1,
          }}
          className="service-coverflow"
          aria-label={t("WIRO travel services", "אפשרויות הטיול של WIRO")}
          onKeyDownCapture={event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const forward = rtl
              ? event.key === "ArrowLeft"
              : event.key === "ArrowRight";
            if (forward) api?.scrollNext(jump());
            else api?.scrollPrev(jump());
          }}
        >
          <CarouselContent className="service-coverflow__track ml-0">
            {services.map((original, index) => {
              const service = { ...original, ...(rtl ? original.he : {}) };
              const href = service.href;
              const visualPosition = getServiceCoverFlowPosition(
                index,
                position,
                services.length
              );
              const isActive = visualPosition === "active";
              return (
                <CarouselItem
                  key={service.id}
                  className="service-coverflow__slide pl-0"
                  data-coverflow-position={visualPosition}
                  data-service-id={service.id}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${index + 1} / ${services.length}: ${service.label}`}
                >
                  <Dialog
                    open={openServiceId === service.id}
                    onOpenChange={open => {
                      if (open && !isActive) {
                        api?.scrollTo(index, jump());
                        return;
                      }
                      setOpenServiceId(open ? service.id : null);
                    }}
                  >
                    <Card className="service-coverflow__card group relative gap-0 overflow-hidden rounded-sm border-0 p-0 py-0">
                      <OptimizedImage
                        src={service.image}
                        alt={service.alt}
                        width={600}
                        height={900}
                        priority={
                          isActive ||
                          visualPosition === "previous" ||
                          visualPosition === "next"
                        }
                        sizes="(min-width: 1440px) 60vw, (min-width: 1024px) 64vw, (min-width: 640px) 72vw, 84vw"
                        className="service-coverflow__image absolute inset-0 h-full w-full object-cover"
                        style={
                          service.id === "motorcycle-tours"
                            ? { objectPosition: "50% 42%" }
                            : undefined
                        }
                      />
                      <div className="service-coverflow__shade absolute inset-0" />
                      <span
                        className="absolute start-5 top-5 rounded-full border border-[#f5f0e7]/30 bg-primary/45 px-3 py-1 text-xs font-medium tabular-nums text-[#f5f0e7]"
                        aria-hidden="true"
                      >
                        0{index + 1}
                      </span>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="service-coverflow__content relative flex h-full w-full flex-col justify-end p-5 text-start text-[#f5f0e7] outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent sm:p-6 lg:p-8"
                          aria-label={`${t(
                            isActive ? "Explore" : "Show",
                            isActive ? "לפרטים על" : "הצגת"
                          )} ${service.label}`}
                          onClick={event => {
                            if (isActive) return;
                            event.preventDefault();
                            api?.scrollTo(index, jump());
                          }}
                        >
                          <span className="mb-2 text-xs font-medium text-[#f5f0e7]/85 sm:mb-3">
                            {service.audience}
                          </span>
                          <h3 className="max-w-[22ch] text-2xl font-semibold leading-[1.05] sm:text-3xl lg:text-4xl">
                            {service.label}
                          </h3>
                          <span className="mt-3 max-w-[48ch] text-sm leading-relaxed text-[#f5f0e7]/85 sm:text-base">
                            {service.summary}
                          </span>
                          <span className="mt-5 flex w-full items-center justify-between border-t border-[#f5f0e7]/25 pt-4 text-sm font-semibold sm:mt-6">
                            {t("Discover more", "לגלות עוד")}
                            <span className="flex size-9 items-center justify-center rounded-full border border-[#f5f0e7]/40 transition-colors group-hover:bg-[#f5f0e7]/15">
                              <Forward className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </span>
                        </button>
                      </DialogTrigger>
                    </Card>
                    <DialogContent
                      lang={language}
                      dir={rtl ? "rtl" : "ltr"}
                      showCloseButton={false}
                      className="max-h-[85dvh] overflow-y-auto sm:max-w-xl"
                    >
                      <DialogClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute end-3 top-3 text-primary"
                          aria-label={t("Close", "סגירה")}
                        >
                          <X aria-hidden="true" />
                        </Button>
                      </DialogClose>
                      <DialogHeader className="text-start sm:text-start">
                        <p className="pe-10 text-sm font-semibold text-primary">
                          {service.label}
                        </p>
                        <DialogTitle className="text-2xl leading-tight">
                          {service.heading}
                        </DialogTitle>
                        <DialogDescription className="leading-relaxed">
                          {service.subheading}
                        </DialogDescription>
                      </DialogHeader>
                      <ul className="list-disc space-y-3 ps-5 text-sm leading-relaxed marker:text-accent">
                        {service.bullets.map(bullet => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                      {service.id === "organized-groups" ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="mt-2 h-auto min-h-12 whitespace-normal py-3">
                              {service.cta}
                              <Forward aria-hidden="true" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir={rtl ? "rtl" : "ltr"}>
                            <DialogHeader>
                              <DialogTitle>
                                {t(
                                  "Let's plan your group trip",
                                  "בואו נתכנן את הטיול הקבוצתי שלכם"
                                )}
                              </DialogTitle>
                              <DialogDescription>
                                {t(
                                  "Contact us with your dates, group size and destinations.",
                                  "שלחו לנו תאריכים, מספר מטיילים ויעדים רצויים."
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <ContactOptions topic="group" />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button
                          asChild
                          className="mt-2 h-auto min-h-12 whitespace-normal py-3"
                        >
                          <a href={href}>
                            {service.cta}
                            <Forward aria-hidden="true" />
                          </a>
                        </Button>
                      )}
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {`${position + 1} / ${services.length}: ${
              rtl ? services[position]?.he.label : services[position]?.label
            }`}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-5 md:justify-between">
            <p className="hidden text-xs text-muted-foreground md:block">
              {t("Find your kind of adventure", "מצאו את ההרפתקה שלכם")}
            </p>
            <div
              className="flex items-center gap-4"
              aria-label={t("Carousel navigation", "ניווט בקרוסלה")}
            >
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-full border-primary/20 bg-background/90 shadow-sm hover:bg-primary hover:text-primary-foreground"
                disabled={!api || !canPrevious}
                onClick={() => api?.scrollPrev(jump())}
                aria-label={t("Previous services", "לאפשרויות הקודמות")}
              >
                <Back aria-hidden="true" />
              </Button>
              <div className="flex items-center gap-1">
                {snaps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex h-11 min-w-6 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    onClick={() => api?.scrollTo(index, jump())}
                    aria-label={`${t("Go to journey", "מעבר למסע")} ${index + 1}: ${
                      rtl ? services[index].he.label : services[index].label
                    }`}
                    aria-current={position === index ? "true" : undefined}
                  >
                    <span
                      className={`h-1 rounded-full transition-all motion-reduce:transition-none ${position === index ? "w-6 bg-primary" : "w-2 bg-primary/25"}`}
                    />
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-full border-primary/20 bg-background/90 shadow-sm hover:bg-primary hover:text-primary-foreground"
                disabled={!api || !canNext}
                onClick={() => api?.scrollNext(jump())}
                aria-label={t("Next services", "לאפשרויות הבאות")}
              >
                <Forward aria-hidden="true" />
              </Button>
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
