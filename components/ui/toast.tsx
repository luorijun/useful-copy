import { createSignal, onCleanup, Show } from "solid-js";
import { X } from "lucide-solid";
import { tv } from "tailwind-variants";

const notice = tv({
  base: "pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
  variants: {
    kind: {
      success: "border-emerald-200 bg-emerald-50 text-emerald-900",
      error: "border-red-200 bg-red-50 text-red-900",
    },
  },
});

export function createToast() {
  const [message, setMessage] = createSignal<{
    text: string;
    kind: "success" | "error";
  }>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  function close() {
    clearTimeout(timer);
    setMessage(undefined);
  }
  function show(text: string, kind: "success" | "error") {
    clearTimeout(timer);
    setMessage({ text, kind });
    timer = setTimeout(close, 5000);
  }
  onCleanup(() => clearTimeout(timer));
  return {
    success: (text: string) => show(text, "success"),
    error: (text: string) => show(text, "error"),
    View: () => (
      <div class="pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto w-fit max-w-[calc(100%-2rem)]">
        <div role="status" aria-live="polite" aria-atomic="true">
          <Show when={message()}>
            {(item) => (
              <div class={notice({ kind: item().kind })}>
                <span>{item().text}</span>
                <button
                  type="button"
                  aria-label="关闭提示"
                  class="rounded p-1 focus-visible:outline-2"
                  onClick={close}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </Show>
        </div>
      </div>
    ),
  };
}
