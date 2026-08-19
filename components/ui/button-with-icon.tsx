import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/ui/line-icons";
import { cn } from "@/lib/cn";

/**
 * A pill whose icon travels: the badge sits at the right, then slides to the
 * left and turns 45° as you point at it, with the padding shifting to make
 * room.
 *
 * Integrated from the supplied component. It was rebuilt on this project's own
 * primitives rather than pulled in as-is: the original is written for a shadcn
 * codebase and needs `lucide-react`, `@radix-ui/react-slot` and
 * `class-variance-authority`. This site ships three runtime dependencies in
 * total (next, react, react-dom), and none of the three would earn its place
 * for one arrow and one variant. The markup, the classes and the transition
 * are the same; `Link` replaces the button because this one navigates.
 */
export function ButtonWithIcon({
  href,
  children,
  className,
}: {
  href: string;
  children: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-12 w-fit items-center overflow-hidden rounded-full",
        "bg-navy-900 p-1 pe-14 ps-6 text-sm font-semibold text-white",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:pe-6 hover:ps-14",
        className,
      )}
    >
      <span className="relative z-10 transition-all duration-500">{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-1 flex h-10 w-10 items-center justify-center rounded-full",
          "bg-white text-navy-900 transition-all duration-500",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:right-[calc(100%-2.75rem)] group-hover:rotate-45",
        )}
      >
        <ArrowUpRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default ButtonWithIcon;
