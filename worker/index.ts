import { reflect, type Env } from "./reflect.ts";

export async function fetch(request: Request, env: Env): Promise<Response> {
	const path = new URL(request.url).pathname;
	if (path === "/api/reflect") {
		if (request.method !== "POST") {
			return Response.json({ error: "Use POST." }, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
		}
		return reflect(request, env);
	}
	if (path.startsWith("/api/")) {
		return Response.json({ error: "Not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
	}
	return env.ASSETS.fetch(request);
}

export default { fetch };
