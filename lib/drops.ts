import { env } from "cloudflare:workers";
import { normalizeAccessCode } from "@/lib/drop-security";

/** Database representation shared by metadata and download endpoints. */
export type DropRow = {
  id: string;
  kind: "text" | "file";
  text_content: string | null;
  object_key: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  access_salt: string | null;
  access_hash: string | null;
  expires_at: number;
};

export async function findDrop(id: string) {
  return env.DB.prepare("SELECT * FROM drops WHERE id=? OR id=?")
    .bind(normalizeAccessCode(id), id)
    .first<DropRow>();
}

/** Delete by the stored ID, including when lookup used an uppercase code. */
export async function removeDrop(row: DropRow) {
  if (row.object_key) await env.BUCKET.delete(row.object_key);
  await env.DB.prepare("DELETE FROM drops WHERE id=?").bind(row.id).run();
}
