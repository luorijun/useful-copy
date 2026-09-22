import { findDrop, removeDrop } from "@/lib/drops";
import { hashCode } from "@/lib/drop-security";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const row = await findDrop(id);
    if (!row)
      return Response.json(
        { error: "寄存内容不存在或已销毁" },
        { status: 404 },
      );
    if (Number(row.expires_at) <= Date.now()) {
      await removeDrop(row);
      return Response.json({ error: "寄存内容已到期销毁" }, { status: 410 });
    }
    if (row.access_hash) {
      const { code = "" } = (await request.json()) as { code?: string };
      if (
        !code ||
        (await hashCode(code, String(row.access_salt))) !== row.access_hash
      )
        return Response.json(
          { error: "访问码不正确", protected: true },
          { status: 403 },
        );
    }
    return Response.json({
      id: row.id,
      kind: row.kind,
      text: row.kind === "text" ? row.text_content : null,
      fileName: row.file_name,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      expiresAt: row.expires_at,
      protected: !!row.access_hash,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "取件服务暂时不可用" }, { status: 500 });
  }
}
