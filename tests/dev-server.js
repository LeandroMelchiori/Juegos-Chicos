const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const relative = pathname === "/" ? "mate-arcade.html" : pathname.slice(1);
  const file = path.resolve(root, relative);
  if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  const type = path.extname(file) === ".html" ? "text/html; charset=utf-8" : "text/plain; charset=utf-8";
  response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(response);
});

server.listen(8765, "127.0.0.1");
