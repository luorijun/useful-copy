import { createSignal } from "solid-js";
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
} from "lucide-solid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createToast } from "@/components/ui/toast";
import { normalizeAccessCode } from "@/lib/drop-security";

type CreatedDrop = { accessCode: string; expiresAt: number };

export default function Home() {
  const toast = createToast();
  const [mode, setMode] = createSignal("pickup"),
    [kind, setKind] = createSignal("text"),
    [text, setText] = createSignal(""),
    [file, setFile] = createSignal<File | null>(null);
  const [hours, setHours] = createSignal("1"),
    [pickupCode, setPickupCode] = createSignal(""),
    [busy, setBusy] = createSignal(false),
    [created, setCreated] = createSignal<CreatedDrop | null>(null);
  let fileRef: HTMLInputElement | undefined;
  function pickup() {
    const code = normalizeAccessCode(pickupCode());
    if (!/^[a-z0-9]{6}$/.test(code)) return toast.error("请输入 6 位访问码");
    location.href = `/${encodeURIComponent(code)}`;
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
    if (busy()) return;
    if (kind() === "text" && !text().trim())
      return toast.error("请输入要寄存的文本");
    if (kind() === "file" && !file()) return toast.error("请选择要寄存的文件");
    if (kind() === "file" && file() && file()!.size > 10 * 1024 * 1024)
      return toast.error("单个文件不能超过 10 MB");
    setBusy(true);
    try {
      const body = new FormData();
      body.set("kind", kind());
      body.set("hours", hours());
      if (kind() === "text") body.set("text", text());
      if (kind() === "file" && file()) body.set("file", file()!);
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
    <main class="min-h-screen overflow-hidden">
      <toast.View />
      <div class="aurora" aria-hidden="true" />
      <header class="topbar">
        <a class="brand" href="/">
          <span class="brand-mark">
            <LockKeyhole size={19} />
          </span>
          临时寄存
        </a>
        <div class="privacy">
          <ShieldCheck size={16} /> 最长保留 24 小时
        </div>
      </header>
      <section class="workspace">
        <div class="intro">
          <p class="eyebrow">STORE · CODE · RETRIEVE</p>
          <h1>
            不用发链接，
            <br />
            <span>报个码就好。</span>
          </h1>
          <p class="lead">
            把文本或文件临时放在这里，系统会生成一枚访问码。对方打开本站、输入访问码即可取出，到期自动销毁。
          </p>
          <div class="principles">
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
        <div class="drop-card">
          <Tabs
            value={mode()}
            onChange={(v) => {
              setMode(v);
              setCreated(null);
            }}
          >
            <TabsList
              aria-label="寄存与取件"
              class="grid h-13 w-full grid-cols-2 bg-slate-100/80 p-1"
            >
              <TabsTrigger value="pickup" class="gap-2">
                <KeyRound size={16} />
                取出内容
              </TabsTrigger>
              <TabsTrigger value="store" class="gap-2">
                <UploadCloud size={16} />
                存入内容
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pickup" class="mode-panel">
              <div class="pickup-prompt">
                <span class="code-orbit">
                  <KeyRound size={28} />
                </span>
                <p class="eyebrow">取出内容</p>
                <h2>输入访问码</h2>
                <p>
                  无需链接。输入寄存者提供的访问码，即可查看文本或下载文件。
                </p>
              </div>
              <Label for="pickup-code">访问码</Label>
              <Input
                id="pickup-code"
                value={pickupCode()}
                maxlength={6}
                onInput={(e) =>
                  setPickupCode(e.currentTarget.value.toLowerCase())
                }
                onKeyDown={(e) => e.key === "Enter" && pickup()}
                placeholder="例如 k7m2q8"
                autocomplete="off"
                autofocus
                class="code-input"
              />
              <Button size="lg" class="submit" onClick={pickup}>
                取出内容
                <ArrowRight size={17} />
              </Button>
              <p class="notice">
                <ShieldCheck size={15} /> 访问码不区分大小写
              </p>
            </TabsContent>
            <TabsContent value="store" class="mode-panel">
              {!created() ? (
                <>
                  <Tabs value={kind()} onChange={setKind}>
                    <TabsList
                      aria-label="内容类型"
                      class="grid h-11 w-full grid-cols-2 bg-transparent p-0"
                    >
                      <TabsTrigger value="text" class="gap-2 border">
                        <Type size={15} />
                        文本
                      </TabsTrigger>
                      <TabsTrigger value="file" class="gap-2 border">
                        <FileUp size={15} />
                        文件
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" class="mt-5">
                      <Label for="content">寄存内容</Label>
                      <Textarea
                        id="content"
                        value={text()}
                        onInput={(e) => setText(e.currentTarget.value)}
                        placeholder="粘贴文字、代码、临时说明……"
                        class="mt-2 min-h-45 resize-none bg-white/70 text-base"
                        maxlength={100000}
                      />
                      <p class="counter">
                        {text().length.toLocaleString()} / 100,000
                      </p>
                    </TabsContent>
                    <TabsContent value="file" class="mt-5">
                      <Label for="file-upload">选择文件</Label>
                      <button
                        type="button"
                        class="file-zone compact"
                        onClick={() => fileRef?.click()}
                      >
                        <input
                          id="file-upload"
                          ref={(input) => {
                            fileRef = input;
                          }}
                          type="file"
                          hidden
                          onChange={(e) =>
                            setFile(e.currentTarget.files?.[0] || null)
                          }
                        />
                        <span class="upload-icon">
                          <UploadCloud size={23} />
                        </span>
                        {file() ? (
                          <>
                            <strong>{file()!.name}</strong>
                            <small>
                              {(file()!.size / 1024 / 1024).toFixed(2)} MB
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
                  <div class="duration-row">
                    <Label for="duration">
                      <Clock3 size={15} /> 寄存时间
                    </Label>
                    <Select
                      id="duration"
                      class="mt-2 w-full bg-white/70"
                      value={hours()}
                      onChange={(e) => setHours(e.currentTarget.value)}
                    >
                      {["1", "3", "6", "12", "24"].map((h) => (
                        <option value={h}>{h} 小时</option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    size="lg"
                    class="submit"
                    disabled={busy()}
                    onClick={submit}
                  >
                    {busy() ? "正在寄存…" : "存入并生成访问码"}
                  </Button>
                  <p class="notice">
                    <ShieldCheck size={15} />{" "}
                    请勿寄存密码、密钥或其他高度敏感信息
                  </p>
                </>
              ) : (
                <div class="success">
                  <span class="success-icon">
                    <Check size={30} />
                  </span>
                  <p class="eyebrow">寄存成功</p>
                  <h2>记下这枚访问码</h2>
                  <p>在本站首页输入它即可取出内容，无需分享链接。</p>
                  <button
                    type="button"
                    class="access-code"
                    onClick={() => copyCode(created()!.accessCode)}
                  >
                    <strong>{created()!.accessCode}</strong>
                    <span>
                      <Copy size={15} /> 点击复制
                    </span>
                  </button>
                  <p class="expires">
                    有效至{" "}
                    {new Date(created()!.expiresAt).toLocaleString("zh-CN", {
                      hour12: false,
                    })}
                  </p>
                  <Button
                    variant="outline"
                    class="w-full"
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
