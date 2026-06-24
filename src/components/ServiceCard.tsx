import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SERVICE_ICONS } from "./icons";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description: string;
  icon: string;
  href?: string;
  tone?: "navy" | "blue" | "yellow" | "light";
}

const TONES = {
  navy: "bg-primary text-primary-foreground",
  blue: "bg-primary-bright text-primary-foreground",
  yellow: "bg-accent text-accent-foreground",
  light: "bg-secondary text-secondary-foreground",
};

export function ServiceCard({ title, description, icon, href, tone = "light" }: Props) {
  const Icon = SERVICE_ICONS[icon] ?? SERVICE_ICONS.home;
  const inner = (
    <div className={cn(
      "group relative h-full rounded-3xl p-6 sm:p-7 transition-all hover:-translate-y-1 hover:shadow-card",
      TONES[tone],
    )}>
      <div className="grid size-14 place-items-center rounded-2xl bg-white/95 text-primary shadow-soft">
        <Icon className="size-7" strokeWidth={2.2} />
      </div>
      <h3 className="mt-5 font-display text-lg font-extrabold leading-tight">{title}</h3>
      <p className={cn("mt-2 text-sm", tone === "light" ? "text-muted-foreground" : "opacity-85")}>
        {description}
      </p>
      {href && (
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold">
          Learn more
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </div>
  );
  return href ? <Link to={href} className="block h-full">{inner}</Link> : inner;
}
