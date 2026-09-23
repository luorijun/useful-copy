import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "tailwind-variants";
export function Label(props: ComponentProps<"label">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <label
      {...rest}
      class={cn(
        "flex items-center gap-2 text-sm leading-none font-medium",
        local.class,
      )}
    />
  );
}
