import { env } from "cloudflare:workers";
import { findDrop, removeDrop } from "@/lib/drops";
import { hashCode, safeName } from "@/lib/drop-security";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const row = await findDrop(id);
    if (!row || row.kind !== "file")
      return new Response("文件不存在", { status: 404 });
    if (Number(row.expires_at) <= Date.now()) {
      await removeDrop(row);
      return new Response("文件已销毁", { status: 410 });
    }
    const { code = "" } = (await request.json()) as { code?: string };
    if (
      row.access_hash &&
      (await hashCode(code, String(row.access_salt))) !== row.access_hash
    )
      return new Response("访问码不正确", { status: 403 });
    const object = await env.BUCKET.get(String(row.object_key));
    if (!object) return new Response("文件不存在", { status: 404 });
    return new Response(object.body, {
      headers: {
        "Content-Type": String(row.mime_type || "application/octet-stream"),
        "Content-Length": String(row.file_size),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(safeName(String(row.file_name)))}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("下载服务暂时不可用", { status: 500 });
  }
}
