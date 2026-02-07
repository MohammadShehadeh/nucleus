import { cn } from "@nucleus/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 items-center gap-2", className)}
      aria-label="Mohammad Shehadeh Logo"
    >
      <Image
        src="https://mohammadshehadeh.com/logo-dark.png"
        className="hidden dark:block"
        alt="MSH Logo"
        width={74}
        height={26.97}
      />
      <Image
        src="https://mohammadshehadeh.com/logo-light.png"
        className="block dark:hidden"
        alt="MSH Logo"
        width={74}
        height={26.97}
      />
    </Link>
  );
};
