import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MapPin, Star, Route, ShieldCheck } from "lucide-react";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold text-secondary">
      {count}
      {suffix}
    </span>
  );
}

export function SocialProofBar() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 30, duration: 0.5 });
  const { data } = trpc.stats.public.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });

  const stats = [
    {
      icon: MapPin,
      value: Math.max(data?.totalBookings ?? 0, 200), // minimum floor
      suffix: "+",
      label: t(
        "Tours Completed",
        "\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05E9\u05D4\u05D5\u05E9\u05DC\u05DE\u05D5"
      ),
    },
    {
      icon: Star,
      value: Math.max(data?.totalReviews ?? 0, 50),
      suffix: "+",
      label: t(
        "5-Star Reviews",
        "\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA 5 \u05DB\u05D5\u05DB\u05D1\u05D9\u05DD"
      ),
    },
    {
      icon: Route,
      value: Math.max(data?.totalTours ?? 0, 6),
      suffix: "",
      label: t(
        "Unique Routes",
        "\u05DE\u05E1\u05DC\u05D5\u05DC\u05D9\u05DD \u05D9\u05D9\u05D7\u05D5\u05D3\u05D9\u05D9\u05DD"
      ),
    },
    {
      icon: ShieldCheck,
      value: 100,
      suffix: "%",
      label: t(
        "Kosher Certified",
        "\u05DB\u05E9\u05E8\u05D5\u05EA \u05DE\u05D0\u05D5\u05E9\u05E8\u05EA"
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-primary/95 text-primary-foreground py-12 sm:py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <stat.icon className="w-8 h-8 text-secondary mb-1" />
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="text-sm sm:text-base text-primary-foreground/80">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
