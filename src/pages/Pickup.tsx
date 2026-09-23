import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Copy,
  Download,
  File,
  KeyRound,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
type Drop = {
  kind: "text" | "file";
  text?: string;
  fileName?: string;
  fileSize?: number;
  expiresAt: number;
};
export default function Pickup({ id }: { id: string }) {
  const [drop, setDrop] = useState<Drop | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [loadedAt, setLoadedAt] = useState(0);
  const open = useCallback(async (dropId: string) => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/drops/${dropId}`, {
        method: "POST",
      });
      const d = (await r.json()) as Drop & { error?: string };
      if (!r.ok) throw new Error(d.error);
      setDrop(d);
      setLoadedAt(Date.now());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "无法取件");
      setDrop(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void open(id);
  }, [id, open]);
  async function download() {
    const r = await fetch(`/api/drops/${id}/file`, {
      method: "POST",
    });
    if (!r.ok) return toast.error(await r.text());
    const b = await r.blob(),
      u = URL.createObjectURL(b),
      a = document.createElement("a");
    a.href = u;
    a.download = drop?.fileName || "download";
    a.click();
    URL.revokeObjectURL(u);
  }
  const remain = drop ? Math.max(0, drop.expiresAt - loadedAt) : 0,
    time =
      remain >= 3600000
        ? `${Math.ceil(remain / 3600000)} 小时内`
        : `${Math.max(1, Math.ceil(remain / 60000))} 分钟内`;
  return (
    <main className="pickup-page">
      <Toaster position="top-center" richColors />
      <div className="pickup-shell">
        <a href="/" className="back">
          <ArrowLeft size={16} />
          返回首页
        </a>
        <div className="pickup-card">
          <div className="pickup-head">
            <span className="brand-mark">
              <LockKeyhole size={19} />
            </span>
            <div>
              <p className="eyebrow">PICK UP</p>
              <h1>取件</h1>
            </div>
          </div>
          {loading ? (
            <div className="state">正在检查寄存内容…</div>
          ) : drop ? (
            <>
              {drop.kind === "text" ? (
                <>
                  <div className="content-label">
                    <span>文本内容</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(drop.text || "");
                        toast.success("文本已复制");
                      }}
                    >
                      <Copy size={15} />
                      复制
                    </Button>
                  </div>
                  <pre className="text-content">{drop.text}</pre>
                </>
              ) : (
                <div className="file-result">
                  <span className="file-icon">
                    <File size={25} />
                  </span>
                  <div>
                    <strong>{drop.fileName}</strong>
                    <small>
                      {((drop.fileSize || 0) / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                  <Button onClick={download}>
                    <Download size={16} />
                    下载
                  </Button>
                </div>
              )}
              <div className="expiry">
                <Clock3 size={16} />
                <span>
                  将在 <strong>{time}</strong>自动销毁
                </span>
              </div>
            </>
          ) : (
            <div className="locked">
              <span className="lock-orbit">
                <KeyRound size={25} />
              </span>
              <h2>无法取件</h2>
              <p>{error}</p>
            </div>
          )}
        </div>
        <p className="pickup-note">到期后的内容无法恢复，请及时保存。</p>
      </div>
    </main>
  );
}
