import { Link } from "@tanstack/react-router";
import { SERVICE_ICONS } from "./icons";

interface Props {
  title: string;
  description: string;
  icon: string;
  href?: string;
}

export function ServiceCard({ title, description, icon, href }: Props) {
  const Icon = SERVICE_ICONS[icon] ?? SERVICE_ICONS.home;
  const inner = (
    <div className="group h-full rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary sm:p-7">
      <div className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-6" strokeWidth={2.2} />
      </div>
      <h3 className="mt-5 font-display text-lg font-extrabold leading-tight text-primary">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {href && (
        <span className="mt-5 inline-block text-sm font-bold text-primary underline decoration-border underline-offset-4 group-hover:decoration-primary">
          Learn more
        </span>
      )}
    </div>
  );
  return href ? (
    <Link to={href} aria-label={title} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
