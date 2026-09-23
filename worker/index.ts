import { createDrop, downloadDrop, getDrop } from "./routes/drops";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "POST" && pathname === "/api/drops") {
      return createDrop(request, env);
    }

    const detailMatch = pathname.match(/^\/api\/drops\/([^/]+)$/);
    if (request.method === "POST" && detailMatch) {
      return getDrop(env, decodeURIComponent(detailMatch[1]));
    }

    const fileMatch = pathname.match(/^\/api\/drops\/([^/]+)\/file$/);
    if (request.method === "POST" && fileMatch) {
      return downloadDrop(env, decodeURIComponent(fileMatch[1]));
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Cloudflare.Env>;
