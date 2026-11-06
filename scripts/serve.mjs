import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
export function serve(root, port = 4173) {
  root = resolve(root);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  };
  const server = http.createServer(async (req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405);
        return res.end();
      }
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      let target = resolve(root, "." + pathname);
      if (target !== root && !target.startsWith(root + sep)) {
        res.writeHead(403);
        return res.end("Forbidden");
      }
      if ((await stat(target)).isDirectory())
        target = resolve(target, "index.html");
      const data = await readFile(target);
      res.writeHead(200, {
        "Content-Type": types[extname(target)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolveReady) =>
    server.listen(port, "127.0.0.1", () => resolveReady(server)),
  );
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const server = await serve(root, Number(process.env.PORT || 4173));
  console.log(`Local demo: http://127.0.0.1:${server.address().port}`);
}
