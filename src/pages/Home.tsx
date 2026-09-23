import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  FileUp,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Type,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { normalizeAccessCode } from "@/lib/drop-security";

type CreatedDrop = { accessCode: string; expiresAt: number };

export default function Home() {
  const [mode, setMode] = useState("pickup"),
    [kind, setKind] = useState("text"),
    [text, setText] = useState(""),
    [file, setFile] = useState<File | null>(null);
  const [hours, setHours] = useState("1"),
    [pickupCode, setPickupCode] = useState(""),
    [busy, setBusy] = useState(false),
    [created, setCreated] = useState<CreatedDrop | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  function pickup() {
    const code = normalizeAccessCode(pickupCode);
    if (!/^[a-z0-9]{6}$/.test(code))
      return toast.error("请输入 6 位访问码");
    location.href = `/pickup/${encodeURIComponent(code)}`;
  }
  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`已完整复制：${code}`);
    } catch {
      toast.error("复制失败，请手动选择访问码");
    }
  }
  async function submit() {
    if (kind === "text" && !text.trim())
      return toast.error("请输入要寄存的文本");
    if (kind === "file" && !file) return toast.error("请选择要寄存的文件");
    if (file && file.size > 10 * 1024 * 1024)
      return toast.error("单个文件不能超过 10 MB");
    setBusy(true);
    try {
      const body = new FormData();
      body.set("kind", kind);
      body.set("hours", hours);
      if (kind === "text") body.set("text", text);
      if (file) body.set("file", file);
      const res = await fetch("/api/drops", { method: "POST", body });
      const data = (await res.json()) as CreatedDrop & { error?: string };
      if (!res.ok) throw new Error(data.error || "寄存失败，请稍后重试");
      setCreated(data);
      toast.success("寄存成功");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "寄存失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen overflow-hidden">
      <Toaster position="top-center" richColors />
      <div className="aurora" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <LockKeyhole size={19} />
          </span>
          临时寄存
        </a>
        <div className="privacy">
          <ShieldCheck size={16} /> 最长保留 24 小时
        </div>
      </header>
      <section className="workspace">
        <div className="intro">
          <p className="eyebrow">STORE · CODE · RETRIEVE</p>
          <h1>
            不用发链接，
            <br />
            <span>报个码就好。</span>
          </h1>
          <p className="lead">
            把文本或文件临时放在这里，系统会生成一枚访问码。对方打开本站、输入访问码即可取出，到期自动销毁。
          </p>
          <div className="principles">
            <div>
              <span>01</span>
              <p>
                <strong>存入</strong>获得系统生成的访问码
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>传码</strong>口述或手动发送都方便
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>取出</strong>打开本站输入访问码
              </p>
            </div>
          </div>
        </div>
        <div className="drop-card">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v);
              setCreated(null);
            }}
          >
            <TabsList className="grid h-13 w-full grid-cols-2 bg-slate-100/80 p-1">
              <TabsTrigger value="pickup" className="gap-2">
                <KeyRound size={16} />
                取出内容
              </TabsTrigger>
              <TabsTrigger value="store" className="gap-2">
                <UploadCloud size={16} />
                存入内容
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pickup" className="mode-panel">
              <div className="pickup-prompt">
                <span className="code-orbit">
                  <KeyRound size={28} />
                </span>
                <p className="eyebrow">取出内容</p>
                <h2>输入访问码</h2>
                <p>
                  无需链接。输入寄存者提供的访问码，即可查看文本或下载文件。
                </p>
              </div>
              <Label htmlFor="pickup-code">访问码</Label>
              <Input
                id="pickup-code"
                value={pickupCode}
                maxLength={6}
                onChange={(e) => setPickupCode(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === "Enter" && pickup()}
                placeholder="例如 k7m2q8"
                autoComplete="off"
                autoFocus
                className="code-input"
              />
              <Button size="lg" className="submit" onClick={pickup}>
                取出内容
                <ArrowRight size={17} />
              </Button>
              <p className="notice">
                <ShieldCheck size={15} /> 访问码不区分大小写
              </p>
            </TabsContent>
            <TabsContent value="store" className="mode-panel">
              {!created ? (
                <>
                  <Tabs value={kind} onValueChange={setKind}>
                    <TabsList className="grid h-11 w-full grid-cols-2 bg-transparent p-0">
                      <TabsTrigger value="text" className="gap-2 border">
                        <Type size={15} />
                        文本
                      </TabsTrigger>
                      <TabsTrigger value="file" className="gap-2 border">
                        <FileUp size={15} />
                        文件
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-5">
                      <Label htmlFor="content">寄存内容</Label>
                      <Textarea
                        id="content"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="粘贴文字、代码、临时说明……"
                        className="mt-2 min-h-45 resize-none bg-white/70 text-base"
                        maxLength={100000}
                      />
                      <p className="counter">
                        {text.length.toLocaleString()} / 100,000
                      </p>
                    </TabsContent>
                    <TabsContent value="file" className="mt-5">
                      <Label>选择文件</Label>
                      <button
                        type="button"
                        className="file-zone compact"
                        onClick={() => fileRef.current?.click()}
                      >
                        <input
                          ref={fileRef}
                          type="file"
                          hidden
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <span className="upload-icon">
                          <UploadCloud size={23} />
                        </span>
                        {file ? (
                          <>
                            <strong>{file.name}</strong>
                            <small>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </>
                        ) : (
                          <>
                            <strong>点击选择文件</strong>
                            <small>单个文件最大 10 MB</small>
                          </>
                        )}
                      </button>
                    </TabsContent>
                  </Tabs>
                  <div className="duration-row">
                    <Label htmlFor="duration">
                      <Clock3 size={15} /> 寄存时间
                    </Label>
                    <Select
                      value={hours}
                      onValueChange={(v) => v && setHours(v)}
                    >
                      <SelectTrigger
                        id="duration"
                        className="mt-2 w-full bg-white/70"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "3", "6", "12", "24"].map((h) => (
                          <SelectItem key={h} value={h}>
                            {h} 小时
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="lg"
                    className="submit"
                    disabled={busy}
                    onClick={submit}
                  >
                    {busy ? "正在寄存…" : "存入并生成访问码"}
                  </Button>
                  <p className="notice">
                    <ShieldCheck size={15} />{" "}
                    请勿寄存密码、密钥或其他高度敏感信息
                  </p>
                </>
              ) : (
                <div className="success">
                  <span className="success-icon">
                    <Check size={30} />
                  </span>
                  <p className="eyebrow">寄存成功</p>
                  <h2>记下这枚访问码</h2>
                  <p>在本站首页输入它即可取出内容，无需分享链接。</p>
                  <button
                    type="button"
                    className="access-code"
                    onClick={() => copyCode(created.accessCode)}
                  >
                    <strong>{created.accessCode}</strong>
                    <span>
                      <Copy size={15} /> 点击复制
                    </span>
                  </button>
                  <p className="expires">
                    有效至{" "}
                    {new Date(created.expiresAt).toLocaleString("zh-CN", {
                      hour12: false,
                    })}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCreated(null);
                      setText("");
                      setFile(null);
                    }}
                  >
                    继续寄存
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <footer>内容到期后不可恢复 · 请提前保存重要文件</footer>
    </main>
  );
}
