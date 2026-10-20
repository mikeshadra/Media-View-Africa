/*
 * Media View Africa: zero-dependency server for local use and small deployments.
 * Serves the static site and a small JSON API for the newsroom and contact form.
 *
 *   npm start                      (http://localhost:3000)
 *   PORT=8080 npm start
 *   NEWSROOM_KEY=secret npm start  (require header "x-newsroom-key" for publish/delete)
 *
 * Data is stored in data/posts.json and data/inquiries.json.
 * For production, replace this with your CMS or database (see README).
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const KEY = process.env.NEWSROOM_KEY || "";
const POSTS = path.join(ROOT, "data", "posts.json");
const INQUIRIES = path.join(ROOT, "data", "inquiries.json");
const CATEGORIES = ["politics", "business", "agriculture", "social", "tech", "sports", "environment"];
const KINDS = ["News update", "Blog", "Opinion", "Feature"];
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon"
};

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return fallback; }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}
function seedPosts() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8"), sandbox);
  return sandbox.window.MVA_DATA.SAMPLE.map((p, i) => ({ id: "sample-" + i, ...p }));
}
if (!fs.existsSync(POSTS)) writeJson(POSTS, seedPosts());

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function body(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => { data += c; if (data.length > 200000) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch (e) { reject(e); } });
  });
}
const clean = (v, max) => String(v == null ? "" : v).trim().slice(0, max);
const authorised = req => !KEY || req.headers["x-newsroom-key"] === KEY;

async function api(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean); // ["api","posts",":id"]
  if (parts[1] === "posts") {
    if (req.method === "GET" && parts.length === 2) {
      const posts = readJson(POSTS, []).sort((a, b) => b.createdAt - a.createdAt);
      return send(res, 200, posts);
    }
    if (req.method === "POST" && parts.length === 2) {
      if (!authorised(req)) return send(res, 401, { error: "Not allowed" });
      const d = await body(req);
      const post = {
        id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        category: CATEGORIES.includes(d.category) ? d.category : "social",
        kind: KINDS.includes(d.kind) ? d.kind : "News update",
        title: clean(d.title, 140), dek: clean(d.dek, 220), body: clean(d.body, 20000),
        author: clean(d.author, 60), authorId: clean(d.authorId, 60), createdAt: Date.now()
      };
      if (post.title.length < 8 || post.body.split(/\s+/).length < 30 || !post.author) return send(res, 400, { error: "Invalid story" });
      const posts = readJson(POSTS, []);
      posts.unshift(post);
      writeJson(POSTS, posts);
      return send(res, 201, post);
    }
    if (req.method === "DELETE" && parts.length === 3) {
      if (!authorised(req)) return send(res, 401, { error: "Not allowed" });
      const posts = readJson(POSTS, []);
      writeJson(POSTS, posts.filter(p => p.id !== parts[2]));
      return send(res, 200, { ok: true });
    }
  }
  if (parts[1] === "contact" && req.method === "POST") {
    const d = await body(req);
    const entry = {
      receivedAt: new Date().toISOString(), name: clean(d.name, 100), email: clean(d.email, 160),
      organisation: clean(d.organisation, 120), services: clean(d.services, 300), message: clean(d.message, 4000)
    };
    if (!entry.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(entry.email) || entry.message.length < 10) return send(res, 400, { error: "Invalid enquiry" });
    const list = readJson(INQUIRIES, []);
    list.push(entry);
    writeJson(INQUIRIES, list);
    return send(res, 201, { ok: true });
  }
  return send(res, 404, { error: "Not found" });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname)));
    const blocked = ["server.js", "package.json", "README.md"].map(f => path.join(ROOT, f));
    if (!file.startsWith(ROOT + path.sep) || file.startsWith(path.join(ROOT, "data") + path.sep) || blocked.includes(file)) return send(res, 404, "Not found", "text/plain");
    fs.readFile(file, (err, data) => {
      if (err) return send(res, 404, "Not found", "text/plain");
      send(res, 200, data, TYPES[path.extname(file)] || "application/octet-stream");
    });
  } catch (e) {
    send(res, 400, { error: "Bad request" });
  }
}).listen(PORT, () => console.log("Media View Africa running at http://localhost:" + PORT));
