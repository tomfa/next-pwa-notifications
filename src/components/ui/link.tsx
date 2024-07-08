import Link from "next/link";
import { cn } from "@/lib/utils";

export const A = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Link
      className={cn(
        "text-blue-400 hover:underline underline-offset-4",
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
};
