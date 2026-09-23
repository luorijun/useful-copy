import {
  createContext,
  createUniqueId,
  Show,
  splitProps,
  useContext,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { cn } from "tailwind-variants";

type TabsProps = {
  value: string;
  onChange: (value: string) => void;
  children: JSX.Element;
};
const Context = createContext<{
  id: string;
  value: string;
  onChange: (value: string) => void;
}>();

function useTabs() {
  const tabs = useContext(Context);
  if (!tabs) throw new Error("Tab components must be inside Tabs");
  return tabs;
}

export function Tabs(props: TabsProps) {
  const id = createUniqueId();
  return (
    <Context.Provider
      value={{
        id,
        get value() {
          return props.value;
        },
        onChange: (value) => props.onChange(value),
      }}
    >
      <div class="flex flex-col gap-2">{props.children}</div>
    </Context.Provider>
  );
}

export function TabsList(
  props: ComponentProps<"div"> & { "aria-label": string },
) {
  const [local, rest] = splitProps(props, ["class"]);
  function navigate(event: KeyboardEvent) {
    const list = event.currentTarget as HTMLDivElement;
    const buttons = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % buttons.length;
        break;
      case "ArrowLeft":
        next = (index - 1 + buttons.length) % buttons.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = buttons.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    buttons[next].focus();
    buttons[next].click();
  }
  return (
    <div
      {...rest}
      role="tablist"
      onKeyDown={navigate}
      class={cn(
        "inline-flex w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        local.class,
      )}
    />
  );
}

export function TabsTrigger(props: {
  value: string;
  class?: string;
  children: JSX.Element;
}) {
  const tabs = useTabs();
  const active = () => tabs.value === props.value;
  return (
    <button
      type="button"
      role="tab"
      id={tabs.id + "-tab-" + props.value}
      aria-controls={tabs.id + "-panel-" + props.value}
      aria-selected={active()}
      tabIndex={active() ? 0 : -1}
      onClick={() => tabs.onChange(props.value)}
      class={cn(
        "inline-flex h-full flex-1 items-center justify-center gap-2 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:shrink-0",
        active()
          ? "bg-background text-foreground shadow-sm"
          : "text-foreground/60 hover:text-foreground",
        props.class,
      )}
    >
      {props.children}
    </button>
  );
}

export function TabsContent(props: {
  value: string;
  class?: string;
  children: JSX.Element;
}) {
  const tabs = useTabs();
  return (
    <div
      role="tabpanel"
      id={tabs.id + "-panel-" + props.value}
      aria-labelledby={tabs.id + "-tab-" + props.value}
      hidden={tabs.value !== props.value}
      tabIndex={0}
      class={cn(
        "flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        props.class,
      )}
    >
      <Show when={tabs.value === props.value}>{props.children}</Show>
    </div>
  );
}
