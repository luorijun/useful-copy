import { splitProps, type ComponentProps } from "solid-js";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline:
        "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },
    size: { default: "h-9 px-4 py-2", sm: "h-8 gap-1.5 px-3", lg: "h-10 px-6" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export function Button(
  props: ComponentProps<"button"> & VariantProps<typeof button>,
) {
  const [local, rest] = splitProps(props, ["class", "variant", "size"]);
  return (
    <button
      type="button"
      {...rest}
      class={button({
        variant: local.variant,
        size: local.size,
        class: local.class,
      })}
    />
  );
}
