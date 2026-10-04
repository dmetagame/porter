// Serve only the final MP4 with byte ranges for the local playback check.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
const path = "output/porter-demo.mp4";
const size = statSync(path).size;
createServer((request, response) => {
  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end('<video controls muted preload="auto" src="/porter-demo.mp4"></video>');
    return;
  }
  if (request.url !== "/porter-demo.mp4") {
    response.writeHead(404).end();
    return;
  }
  const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  const start = range ? Number(range[1]) : 0;
  const end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  if (start >= size || end < start) {
    response.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
    return;
  }
  const headers = { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Content-Length": end - start + 1 };
  if (range) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  response.writeHead(range ? 206 : 200, headers);
  if (request.method === "HEAD") response.end();
  else createReadStream(path, { start, end }).pipe(response);
}).listen(8799, "127.0.0.1", () => console.log("Porter MP4 playback server: http://127.0.0.1:8799"));
