import { useState, useEffect, useRef } from "react";
import { Map, Users, Route, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STATS = [
  {
    icon: Map,
    target: 500,
    suffix: "+",
    en: "Tours Completed",
    he: "טיולים שהושלמו",
  },
  {
    icon: Users,
    target: 120,
    suffix: "+",
    en: "Happy Travelers",
    he: "מטיילים מרוצים",
  },
  {
    icon: Route,
    target: 6,
    suffix: "",
    en: "Unique Routes",
    he: "מסלולים ייחודיים",
  },
  {
    icon: ShieldCheck,
    target: 100,
    suffix: "%",
    en: "Kosher Certified",
    he: "כשרות מוסמכת",
  },
];

function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let rafId: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [target, isVisible, duration]);

  return count;
}

function StatItem({
  icon: Icon,
  target,
  suffix,
  label,
  isVisible,
}: {
  icon: typeof Map;
  target: number;
  suffix: string;
  label: string;
  isVisible: boolean;
}) {
  const count = useCountUp(target, isVisible);
  return (
    <div className="flex flex-col items-center text-center p-4">
      <Icon
        className="w-8 h-8 text-[#d4af37] mb-2"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="text-3xl md:text-4xl font-heading font-bold text-[#d4af37]">
        {count}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export function StatsCounter() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 bg-[#fdfbf7] dark:bg-[#1A1A1A] border-y border-[#e8e2da] dark:border-[#333]">
      <div
        ref={ref}
        className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <StatItem
              key={stat.en}
              icon={stat.icon}
              target={stat.target}
              suffix={stat.suffix}
              label={t(stat.en, stat.he)}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
