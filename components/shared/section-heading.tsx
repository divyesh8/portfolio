import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <header className={cn("section-heading", className)}>
      {eyebrow && <p className="section-kicker">{eyebrow}</p>}
      <h2>
        {title}
        <span aria-hidden>.</span>
      </h2>
      {lede && <p className="section-lede">{lede}</p>}
    </header>
  );
}
