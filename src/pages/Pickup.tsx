import { createEffect, createSignal, onCleanup } from "solid-js";
import {
  ArrowLeft,
  Clock3,
  Copy,
  Download,
  File,
  KeyRound,
  LockKeyhole,
} from "lucide-solid";
import { Button } from "@/components/ui/button";
import { createToast } from "@/components/ui/toast";
type Drop = {
  kind: "text" | "file";
  text?: string;
  fileName?: string;
  fileSize?: number;
  expiresAt: number;
};
export default function Pickup(props: { id: string }) {
  const toast = createToast();
  const [drop, setDrop] = createSignal<Drop | null>(null),
    [error, setError] = createSignal(""),
    [loading, setLoading] = createSignal(true),
    [loadedAt, setLoadedAt] = createSignal(0);
  async function open(dropId: string, signal: AbortSignal) {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/drops/${dropId}`, {
        method: "POST",
        signal,
      });
      const d = (await r.json()) as Drop & { error?: string };
      if (!r.ok) throw new Error(d.error);
      if (signal.aborted) return;
      setDrop(d);
      setLoadedAt(Date.now());
    } catch (e: unknown) {
      if (signal.aborted) return;
      setError(e instanceof Error ? e.message : "无法取件");
      setDrop(null);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }
  createEffect(() => {
    const controller = new AbortController();
    void open(props.id, controller.signal);
    onCleanup(() => controller.abort());
  });
  async function download() {
    const r = await fetch(`/api/drops/${props.id}/file`, {
      method: "POST",
    });
    if (!r.ok) return toast.error(await r.text());
    const b = await r.blob(),
      u = URL.createObjectURL(b),
      a = document.createElement("a");
    a.href = u;
    a.download = drop()?.fileName || "download";
    a.click();
    URL.revokeObjectURL(u);
  }
  const remain = () =>
    drop() ? Math.max(0, drop()!.expiresAt - loadedAt()) : 0;
  const time = () =>
    remain() >= 3600000
      ? `${Math.ceil(remain() / 3600000)} 小时内`
      : `${Math.max(1, Math.ceil(remain() / 60000))} 分钟内`;
  return (
    <main class="pickup-page">
      <toast.View />
      <div class="pickup-shell">
        <a href="/" class="back">
          <ArrowLeft size={16} />
          返回首页
        </a>
        <div class="pickup-card">
          <div class="pickup-head">
            <span class="brand-mark">
              <LockKeyhole size={19} />
            </span>
            <div>
              <p class="eyebrow">PICK UP</p>
              <h1>取件</h1>
            </div>
          </div>
          {loading() ? (
            <div class="state">正在检查寄存内容…</div>
          ) : drop() ? (
            <>
              {drop()!.kind === "text" ? (
                <>
                  <div class="content-label">
                    <span>文本内容</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(drop()!.text || "");
                        toast.success("文本已复制");
                      }}
                    >
                      <Copy size={15} />
                      复制
                    </Button>
                  </div>
                  <pre class="text-content">{drop()!.text}</pre>
                </>
              ) : (
                <div class="file-result">
                  <span class="file-icon">
                    <File size={25} />
                  </span>
                  <div>
                    <strong>{drop()!.fileName}</strong>
                    <small>
                      {((drop()!.fileSize || 0) / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                  <Button onClick={download}>
                    <Download size={16} />
                    下载
                  </Button>
                </div>
              )}
              <div class="expiry">
                <Clock3 size={16} />
                <span>
                  将在 <strong>{time()}</strong>自动销毁
                </span>
              </div>
            </>
          ) : (
            <div class="locked">
              <span class="lock-orbit">
                <KeyRound size={25} />
              </span>
              <h2>无法取件</h2>
              <p>{error()}</p>
            </div>
          )}
        </div>
        <p class="pickup-note">到期后的内容无法恢复，请及时保存。</p>
      </div>
    </main>
  );
}
