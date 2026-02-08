interface BlogPostHeroProps {
  image: string;
  title: string;
}

export function BlogPostHero({ image, title }: BlogPostHeroProps) {
  return (
    <div className="relative h-96 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
}
