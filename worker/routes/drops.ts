import { accessCodeFromSequence, safeName } from "../../lib/drop-security";
import { findDrop, removeDrop } from "../lib/drops";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_HOURS = new Set([1, 3, 6, 12, 24]);

export async function createDrop(request: Request, env: Cloudflare.Env) {
  try {
    const form = await request.formData();
    const kind = String(form.get("kind") || "");
    const hours = Number(form.get("hours"));

    if (kind !== "text" && kind !== "file") {
      return Response.json({ error: "寄存类型无效" }, { status: 400 });
    }
    if (!ALLOWED_HOURS.has(hours)) {
      return Response.json({ error: "寄存时间无效" }, { status: 400 });
    }

    const sequenceRow = await env.DB.prepare(
      "INSERT INTO access_code_sequence (name,next_value) VALUES ('drops',0) ON CONFLICT(name) DO UPDATE SET next_value=next_value+1 RETURNING next_value",
    ).first<{ next_value: number }>();

    if (!sequenceRow) {
      return Response.json(
        { error: "暂时无法生成访问码，请重试" },
        { status: 503 },
      );
    }

    const id = accessCodeFromSequence(Number(sequenceRow.next_value));
    const now = Date.now();
    const expiresAt = now + hours * 3_600_000;

    let textContent: string | null = null;
    let objectKey: string | null = null;
    let fileName: string | null = null;
    let mimeType: string | null = null;
    let fileSize: number | null = null;

    if (kind === "text") {
      textContent = String(form.get("text") || "").trim();
      if (!textContent || textContent.length > 100_000) {
        return Response.json(
          { error: "文本不能为空且不能超过 100,000 字" },
          { status: 400 },
        );
      }
    } else {
      const file = form.get("file");
      if (!(file instanceof File) || !file.size || file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: "请选择不超过 10 MB 的文件" },
          { status: 400 },
        );
      }

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
        "INSERT INTO drops (id,kind,text_content,object_key,file_name,mime_type,file_size,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?)",
      )
        .bind(
          id,
          kind,
          textContent,
          objectKey,
          fileName,
          mimeType,
          fileSize,
          now,
          expiresAt,
        )
        .run();
    } catch (error) {
      if (objectKey) await env.BUCKET.delete(objectKey);
      throw error;
    }

    return Response.json({ accessCode: id, expiresAt }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "寄存服务暂时不可用，请稍后重试" },
      { status: 500 },
    );
  }
}

export async function getDrop(env: Cloudflare.Env, id: string) {
  try {
    const row = await findDrop(env, id);
    if (!row) {
      return Response.json(
        { error: "寄存内容不存在或已销毁" },
        { status: 404 },
      );
    }

    if (Number(row.expires_at) <= Date.now()) {
      await removeDrop(env, row);
      return Response.json({ error: "寄存内容已到期销毁" }, { status: 410 });
    }

    return Response.json({
      id: row.id,
      kind: row.kind,
      text: row.kind === "text" ? row.text_content : null,
      fileName: row.file_name,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      expiresAt: row.expires_at,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "取件服务暂时不可用" }, { status: 500 });
  }
}

export async function downloadDrop(env: Cloudflare.Env, id: string) {
  try {
    const row = await findDrop(env, id);
    if (!row || row.kind !== "file") {
      return new Response("文件不存在", { status: 404 });
    }

    if (Number(row.expires_at) <= Date.now()) {
      await removeDrop(env, row);
      return new Response("文件已销毁", { status: 410 });
    }

    const object = await env.BUCKET.get(String(row.object_key));
    if (!object) return new Response("文件不存在", { status: 404 });

    return new Response(object.body, {
      headers: {
        "Content-Type": String(row.mime_type || "application/octet-stream"),
        "Content-Length": String(row.file_size),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          safeName(String(row.file_name)),
        )}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("下载服务暂时不可用", { status: 500 });
  }
}
