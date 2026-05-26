const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.join(__dirname, "..", "dist");
const port = Number(process.env.PORT || 3007);

const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url || "/").split("?")[0]);
  const safePath = path.normalize(urlPath).replace(/^([.][.][\\/])+/, "");
  let filePath = path.join(root, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      filePath = path.join(root, "index.html");
    }

    fs.readFile(filePath, (readError, contents) => {
      if (readError) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "content-type": mime[path.extname(filePath)] || "application/octet-stream"
      });
      response.end(contents);
    });
  });
});

server.listen(port, () => {
  console.log(`Mobile web listo en http://localhost:${port}`);
});
