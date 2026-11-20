#!/usr/bin/env node
// Zero-dependency local preview server for the myobserver.io static site.
// Usage: node scripts/serve.mjs  (default http://localhost:8080, PORT env overrides)
import http from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "text/plain" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(res, 400, "400 Bad Request");
  }
  if (pathname === "/") pathname = "/index.html";

  const filePath = path.normalize(path.join(root, pathname));
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    return send(res, 403, "403 Forbidden");
  }

  (async () => {
    let target = filePath;
    try {
      const info = await stat(target);
      if (info.isDirectory()) target = path.join(target, "index.html");
    } catch {
      return send(res, 404, "404 Not Found");
    }

    const type = MIME[path.extname(target).toLowerCase()] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    createReadStream(target)
      .on("error", () => {
        if (!res.headersSent) send(res, 404, "404 Not Found");
        else res.destroy();
      })
      .pipe(res);
  })().catch(() => {
    if (!res.headersSent) send(res, 500, "500 Internal Server Error");
    else res.destroy();
  });
});

server.listen(port, () => {
  console.log(`Serving ${root}`);
  console.log(`Open http://localhost:${port}`);
});
