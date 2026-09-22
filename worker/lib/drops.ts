import { normalizeAccessCode } from "../../lib/drop-security";

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

export async function findDrop(env: Cloudflare.Env, id: string) {
  return env.DB.prepare("SELECT * FROM drops WHERE id=? OR id=?")
    .bind(normalizeAccessCode(id), id)
    .first<DropRow>();
}

export async function removeDrop(env: Cloudflare.Env, row: DropRow) {
  if (row.object_key) await env.BUCKET.delete(row.object_key);
  await env.DB.prepare("DELETE FROM drops WHERE id=?").bind(row.id).run();
}
