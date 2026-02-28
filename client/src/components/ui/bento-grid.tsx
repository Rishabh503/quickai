import { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon: React.ElementType;
  description: string;
  href: string;
  cta: string;
}

/* GRID WRAPPER */
const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        // responsive, compact grid with good spacing
        "grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/* CARD */
const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/10 transition-all duration-500 ease-out hover:bg-neutral-800/50 hover:border-red-500/50 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
      "p-8",
      className
    )}
    {...props}
  >
    {/* Background (optional images etc.) */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 -z-10">{background}</div>

    {/* Main content */}
    <div className="z-10 flex flex-col justify-between h-full">
      <div className="transition-all duration-500">
        <div className="inline-flex p-3 rounded-2xl bg-neutral-800 border border-white/5 mb-6 group-hover:border-red-500/50 transition-colors duration-500">
          <Icon className="h-8 w-8 text-neutral-400 transition-all duration-500 group-hover:text-red-500 group-hover:scale-110" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors duration-500">
          {name}
        </h3>
        <p className="text-neutral-400 leading-relaxed font-medium group-hover:text-neutral-300 transition-colors duration-500">
          {description}
        </p>
      </div>

      {/* Button */}
      <div className="mt-8">
        <Button
          variant="link"
          asChild
          size="sm"
          className="text-red-500 hover:text-red-400 p-0 font-semibold group/btn"
        >
          <a href={href} className="inline-flex items-center">
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </a>
        </Button>
      </div>
    </div>
  </div>
);

export { BentoCard, BentoGrid };
