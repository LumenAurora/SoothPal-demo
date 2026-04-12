interface SectionTitleProps {
  kicker: string;
  title: string;
  description: string;
}

export function SectionTitle({ kicker, title, description }: SectionTitleProps) {
  return (
    <header className="section-title">
      <p className="section-title__kicker">{kicker}</p>
      <h2>{title}</h2>
      <p className="section-title__description">{description}</p>
    </header>
  );
}
