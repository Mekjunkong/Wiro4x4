interface PremiumSectionHeadingProps {
  eyebrow: string;
  heading: string;
  description?: string;
  decorativeBgText?: string;
  className?: string;
}

/**
 * Premium section heading pattern:
 * - Eyebrow: small caps, gold, wide letter-spacing
 * - Heading: large, bold, tight tracking
 * - Gold underline: 3px, 60px wide, centered
 * - Optional decorative background text
 * - Optional description paragraph
 */
export function PremiumSectionHeading({
  eyebrow,
  heading,
  description,
  decorativeBgText,
  className = "",
}: PremiumSectionHeadingProps) {
  return (
    <div className={`text-center relative ${className}`}>
      {decorativeBgText && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-[7rem] md:text-[10rem] font-heading font-black text-foreground/[0.03] dark:text-white/[0.03] leading-none select-none pointer-events-none tracking-widest">
          {decorativeBgText}
        </span>
      )}
      <span className="relative text-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">
        {eyebrow}
      </span>
      <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground dark:text-white tracking-tight">
        {heading}
      </h2>
      <div className="w-16 h-[3px] bg-accent mx-auto mt-4" />
      {description && (
        <p className="relative text-muted-foreground dark:text-white/60 mt-5 max-w-2xl mx-auto text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
