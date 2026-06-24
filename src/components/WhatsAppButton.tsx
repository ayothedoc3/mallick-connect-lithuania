import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

interface Props {
  message?: string;
  className?: string;
  label?: string;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function WhatsAppButton({
  message = "Hello Mallick Assist Service, I'd like to ask about your services.",
  className,
  label = "Chat on WhatsApp",
  variant = "solid",
  size = "md",
}: Props) {
  const sizes = {
    sm: "px-3 py-2 text-sm gap-1.5",
    md: "px-5 py-3 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2",
  };
  const variants = {
    solid: "bg-whatsapp text-whatsapp-foreground hover:brightness-110 shadow-soft",
    outline:
      "border-2 border-whatsapp text-whatsapp bg-transparent hover:bg-whatsapp hover:text-whatsapp-foreground",
    ghost: "text-whatsapp hover:bg-whatsapp/10",
  };
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition-all",
        sizes[size],
        variants[variant],
        className,
      )}
    >
      <MessageCircle className="size-4" strokeWidth={2.5} />
      {label}
    </a>
  );
}

export function FloatingWhatsApp() {
  return (
    <a
      href={waLink("Hello Mallick Assist Service!")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-card hover:scale-105 transition-transform"
    >
      <MessageCircle className="size-7" strokeWidth={2.5} />
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-30" />
    </a>
  );
}
