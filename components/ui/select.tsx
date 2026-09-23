import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "tailwind-variants";
export function Select(props: ComponentProps<"select">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <select
      {...rest}
      class={cn(
        "h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        local.class,
      )}
    />
  );
}
