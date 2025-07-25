const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // 添加CORS頭
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 處理OPTIONS請求
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = "." + req.url;

  // 移除查詢參數
  filePath = filePath.split("?")[0];

  if (filePath === "./") {
    filePath = "./index.html";
  }

  console.log(`Request: ${req.method} ${req.url} -> ${filePath}`);

  const extname = path.extname(filePath);
  let contentType = "text/html";

  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
    case ".jpeg":
      contentType = "image/jpeg";
      break;
    case ".gif":
      contentType = "image/gif";
      break;
    case ".svg":
      contentType = "image/svg+xml";
      break;
    case ".ico":
      contentType = "image/x-icon";
      break;
    case ".woff":
      contentType = "font/woff";
      break;
    case ".woff2":
      contentType = "font/woff2";
      break;
    case ".ttf":
      contentType = "font/ttf";
      break;
    case ".eot":
      contentType = "application/vnd.ms-fontobject";
      break;
  }

  // 檢查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`File not found: ${filePath}`);
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(`Error reading file ${filePath}:`, error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Server error: ${error.code}`);
    } else {
      console.log(`Serving: ${filePath} (${contentType})`);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.end(content, "utf-8");
    }
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log("Press Ctrl+C to stop the server");
  console.log("Available files:");
  console.log("- index.html");
  console.log("- order.html");
  console.log("- product.html");
  console.log("- styles.css");
  console.log("- assets/");
});
