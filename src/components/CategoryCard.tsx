import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  image: string;
  link: string;
}

export default function CategoryCard({ name, image, link }: CategoryCardProps) {
  return (
    <Link to={link} className="group block relative overflow-hidden aspect-[3/4]">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
      <div className="absolute inset-0 flex items-end p-6">
        <div>
          <h3 className="font-display text-lg md:text-xl font-semibold text-primary-foreground mb-2">{name}</h3>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/80 font-body border-b border-primary-foreground/40 pb-0.5 group-hover:border-primary-foreground transition-colors">
            Shop Now
          </span>
        </div>
      </div>
    </Link>
  );
}
