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
      "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-md border border-gray-200 transition-all duration-300 ease-out hover:shadow-lg hover:border-red-400 hover:-translate-y-1",
      "p-6 sm:p-8",
      className
    )}
    {...props}
  >
    {/* Background (optional images etc.) */}
    <div className="absolute inset-0 -z-10">{background}</div>

    {/* Main content */}
    <div className="z-10 flex flex-col justify-between h-full">
      <div className="transition-all duration-300 group-hover:-translate-y-1">
        <Icon className="h-8 w-8 text-gray-700 mb-4 transition-all duration-300 group-hover:text-red-500" />
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-500">
          {name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-700">
          {description}
        </p>
      </div>

      {/* Button */}
      <div className="mt-4">
        <Button
          variant="link"
          asChild
          size="sm"
          className="text-red-500 hover:text-red-600 p-0"
        >
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4 inline-block" />
          </a>
        </Button>
      </div>
    </div>
  </div>
);

export { BentoCard, BentoGrid };
