interface PremiumSectionHeadingProps {
  eyebrow: string;
  heading: string;
  description?: string;
  className?: string;
}

export function PremiumSectionHeading({
  eyebrow,
  heading,
  description,
  className = "",
}: PremiumSectionHeadingProps) {
  return (
    <div className={`relative text-center ${className}`}>
      <span className="relative mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-accent-readable">
        {eyebrow}
      </span>
      <h2 className="relative font-heading text-4xl font-medium tracking-tight text-foreground md:text-5xl">
        {heading}
      </h2>
      <div className="mx-auto mt-5 h-px w-14 bg-accent" />
      {description && (
        <p className="relative mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
