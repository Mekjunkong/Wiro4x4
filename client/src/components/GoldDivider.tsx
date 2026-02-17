import { useScrollReveal } from "@/hooks/useScrollReveal";

export function GoldDivider({ className = "" }: { className?: string }) {
  const ref = useScrollReveal<HTMLDivElement>({ y: 0, duration: 0.6 });

  return (
    <div
      ref={ref}
      className={`h-px w-16 bg-[#D4AF37] mx-auto my-6 ${className}`}
    />
  );
}
