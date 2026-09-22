import { env } from "cloudflare:workers";
import { accessCodeFromSequence } from "@/lib/drop-security";

export async function POST(request: Request) {
  try {
    const form = await request.formData(),
      kind = String(form.get("kind") || "");
    const hours = Number(form.get("hours"));
    if (!["text", "file"].includes(kind))
      return Response.json({ error: "寄存类型无效" }, { status: 400 });
    if (![1, 3, 6, 12, 24].includes(hours))
      return Response.json({ error: "寄存时间无效" }, { status: 400 });
    const sequenceRow = await env.DB.prepare(
      "INSERT INTO access_code_sequence (name,next_value) VALUES ('drops',0) ON CONFLICT(name) DO UPDATE SET next_value=next_value+1 RETURNING next_value",
    ).first<{ next_value: number }>();
    if (!sequenceRow)
      return Response.json(
        { error: "暂时无法生成访问码，请重试" },
        { status: 503 },
      );
    const id = accessCodeFromSequence(Number(sequenceRow.next_value));
    const now = Date.now(),
      expiresAt = now + hours * 3600000;
    let textContent: string | null = null,
      objectKey: string | null = null,
      fileName: string | null = null,
      mimeType: string | null = null,
      fileSize: number | null = null;
    if (kind === "text") {
      textContent = String(form.get("text") || "").trim();
      if (!textContent || textContent.length > 100000)
        return Response.json(
          { error: "文本不能为空且不能超过 100,000 字" },
          { status: 400 },
        );
    } else {
      const file = form.get("file");
      if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024)
        return Response.json(
          { error: "请选择不超过 10 MB 的文件" },
          { status: 400 },
        );
      objectKey = `drops/${id}`;
      fileName = file.name.slice(0, 180);
      mimeType = file.type || "application/octet-stream";
      fileSize = file.size;
      await env.BUCKET.put(objectKey, file.stream(), {
        httpMetadata: { contentType: mimeType },
      });
    }
    try {
      await env.DB.prepare(
        "INSERT INTO drops (id,kind,text_content,object_key,file_name,mime_type,file_size,access_salt,access_hash,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      )
        .bind(
          id,
          kind,
          textContent,
          objectKey,
          fileName,
          mimeType,
          fileSize,
          null,
          null,
          now,
          expiresAt,
        )
        .run();
    } catch (e) {
      if (objectKey) await env.BUCKET.delete(objectKey);
      throw e;
    }
    return Response.json({ id, accessCode: id, expiresAt }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "寄存服务暂时不可用，请稍后重试" },
      { status: 500 },
    );
  }
}
