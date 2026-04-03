import { Star, Users, MessageCircle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";

const TRUST_ITEMS = [
  {
    icon: Star,
    value: "4.9",
    en: "Google Rating",
    he: "דירוג גוגל",
    targetNum: 4.9,
    isDecimal: true,
  },
  {
    icon: Users,
    value: "500+",
    en: "Happy Travelers",
    he: "מטיילים מרוצים",
    targetNum: 500,
    suffix: "+",
  },
  {
    icon: MessageCircle,
    value: "עברית",
    en: "Hebrew Speaking",
    he: "דוברי עברית",
    targetNum: null,
  },
  {
    icon: ShieldCheck,
    value: "100%",
    en: "Kosher Meals",
    he: "אוכל כשר",
    targetNum: 100,
    suffix: "%",
  },
];

function AnimatedNumber({
  target,
  suffix = "",
  isDecimal = false,
}: {
  target: number;
  suffix?: string;
  isDecimal?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const duration = 1200;
          const steps = 40;
          const stepTime = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(
              isDecimal
                ? Math.round(eased * target * 10) / 10
                : Math.round(eased * target)
            );
            if (step >= steps) clearInterval(timer);
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? count.toFixed(1) : count}
      {suffix}
    </span>
  );
}

export function TrustBar() {
  const { t } = useLanguage();

  return (
    <section className="py-6 md:py-8 bg-primary border-y border-accent/20">
      <div className="container">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-0">
          {TRUST_ITEMS.map((item, i) => (
            <div key={item.en} className="flex items-center">
              <div className="flex items-center gap-3 text-white/90 px-6 md:px-10">
                <item.icon className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-2xl text-white leading-tight">
                    {item.targetNum !== null && item.targetNum !== undefined ? (
                      <AnimatedNumber
                        target={item.targetNum}
                        suffix={item.suffix}
                        isDecimal={item.isDecimal}
                      />
                    ) : (
                      item.value
                    )}
                  </span>
                  <span className="text-xs text-white/60 uppercase tracking-wider">
                    {t(item.en, item.he)}
                  </span>
                </div>
              </div>
              {i < TRUST_ITEMS.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-accent/25" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
