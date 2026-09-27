// LifeOS local server — zero npm dependencies (Node 22.13+ built-ins only).
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

let DatabaseSync;
try { ({ DatabaseSync } = require("node:sqlite")); }
catch { console.error("\nLifeOS needs Node.js 22.13 or newer. Get the LTS from https://nodejs.org\n"); process.exit(1); }

const FRONT = path.join(__dirname, "..", "frontend");
const DATA = process.env.LIFEOS_DATA || path.join(__dirname, "..", "data");
fs.mkdirSync(DATA, { recursive: true });
const DB_FILE = path.join(DATA, "lifeos.db");
const db = new DatabaseSync(DB_FILE);
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY, name TEXT NOT NULL, detail TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, icon TEXT DEFAULT '✨', color TEXT DEFAULT '#2f8f72',
  items_json TEXT NOT NULL DEFAULT '[]', days_json TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]',
  day_plans_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, module_id INTEGER NOT NULL, log_date TEXT NOT NULL,
  text TEXT NOT NULL, at TEXT, FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS fin_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, icon TEXT DEFAULT '💰',
  color TEXT DEFAULT '#2f8f72', budget REAL NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS fin_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER NOT NULL, amount REAL NOT NULL,
  note TEXT DEFAULT '', entry_date TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
`);

const tx = (fn) => { db.exec("BEGIN"); try { const r = fn(); db.exec("COMMIT"); return r; } catch (e) { db.exec("ROLLBACK"); throw e; } };

function seedFinance() {
  const ins = db.prepare("INSERT INTO fin_categories(name,icon,color,budget) VALUES(?,?,?,?)");
  [["Food & Groceries","🛒","#ef7668",5000],["Transport","🚌","#5b8def",2000],["Bills & Rent","🏠","#8b6fe8",8000],
   ["Shopping","🛍️","#d7aa45",3000],["Fun","🎉","#54b879",2000]].forEach(x => ins.run(...x));
}

if (db.prepare("SELECT COUNT(*) c FROM modules").get().c === 0) {
  const ins = db.prepare("INSERT INTO modules(id,name,icon,color,items_json,days_json,day_plans_json) VALUES(?,?,?,?,?,?,?)");
  [[1,"OTA","🎖️","#f29d49",["Maths","English","GK"],[1,2,3,4,5,6,7]],[2,"Career","💻","#5b8def",["DSA","Projects","Applications"],[1,3,5]],
   [3,"College","🎓","#8b6fe8",["Classes","Assignments"],[1,2,3,4,5]],[4,"Track","🏃","#54b879",["Run","Speed work"],[2,5]],
   [5,"Food","🍽️","#ef7668",["Meals","Protein","Water"],[1,2,3,4,5,6,7]],[6,"Life Reset","🧹","#d7aa45",["Sleep","Room","Personal"],[1,2,3,4,5,6,7]]]
    .forEach(x => ins.run(x[0],x[1],x[2],x[3],JSON.stringify(x[4]),JSON.stringify(x[5]),"{}"));
  db.prepare("INSERT OR IGNORE INTO goals(id,name,detail) VALUES(1,?,?)")
    .run("Build a life that moves forward", "Add your own goals and connect modules to them.");
}
if (db.prepare("SELECT COUNT(*) c FROM fin_categories").get().c === 0) seedFinance();

const getSettings = () => {
  const s = Object.fromEntries(db.prepare("SELECT key,value FROM settings").all().map(r => [r.key, r.value]));
  return { currency: s.currency || "₹", income: Number(s.income || 0) };
};
const setSetting = (k, v) => db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(k, String(v));
const moduleRow = r => ({ id: r.id, name: r.name, icon: r.icon, color: r.color,
  items: JSON.parse(r.items_json || "[]"), days: JSON.parse(r.days_json || "[]"), dayPlans: JSON.parse(r.day_plans_json || "{}") });
const bad = (msg) => [400, { error: msg }];
const num = v => (Number.isFinite(Number(v)) ? Number(v) : NaN);

const routes = [];
const route = (method, p, fn) => routes.push([method, new RegExp("^" + p + "$"), fn]);

route("GET", "/api/health", () => ({ ok: true, database: "SQLite" }));

route("GET", "/api/state", () => {
  const goals = db.prepare("SELECT id,name,detail FROM goals ORDER BY id").all();
  const modules = db.prepare("SELECT * FROM modules ORDER BY id").all().map(moduleRow);
  const logs = {};
  for (const r of db.prepare("SELECT id,module_id,log_date,text,at FROM logs ORDER BY id").all())
    (logs[r.log_date] ||= []).push({ id: r.id, moduleId: r.module_id, text: r.text, at: r.at });
  return { goals, modules, logs };
});

route("PUT", "/api/state", ({ body }) => {
  const { goals = [], modules = [], logs = {} } = body || {};
  tx(() => {
    db.prepare("DELETE FROM logs").run(); db.prepare("DELETE FROM goals").run(); db.prepare("DELETE FROM modules").run();
    const g = db.prepare("INSERT INTO goals(id,name,detail) VALUES(?,?,?)");
    goals.forEach(x => g.run(x.id, x.name, x.detail || ""));
    const m = db.prepare("INSERT INTO modules(id,name,icon,color,items_json,days_json,day_plans_json) VALUES(?,?,?,?,?,?,?)");
    modules.forEach(x => m.run(x.id, x.name, x.icon || "✨", x.color || "#2f8f72", JSON.stringify(x.items || []), JSON.stringify(x.days || []), JSON.stringify(x.dayPlans || {})));
    const l = db.prepare("INSERT INTO logs(module_id,log_date,text,at) VALUES(?,?,?,?)");
    for (const [d, arr] of Object.entries(logs)) (arr || []).forEach(x => l.run(x.moduleId, d, x.text, x.at || ""));
  });
  return { ok: true };
});

route("POST", "/api/logs", ({ body }) => {
  const { moduleId, date, text, at = "" } = body || {};
  if (!moduleId || !date || !String(text || "").trim()) return bad("moduleId, date and text are required");
  const r = db.prepare("INSERT INTO logs(module_id,log_date,text,at) VALUES(?,?,?,?)").run(moduleId, date, String(text).trim(), at);
  return [201, { id: Number(r.lastInsertRowid), moduleId, date, text: String(text).trim(), at }];
});

route("DELETE", "/api/reset", () => {
  tx(() => {
    ["logs","modules","goals","fin_entries","fin_categories","settings"].forEach(t => db.prepare(`DELETE FROM ${t}`).run());
    seedFinance();
  });
  return { ok: true };
});

route("GET", "/api/finance", ({ query }) => {
  const q = query.get("month") || "";
  const month = /^\d{4}-\d{2}$/.test(q) ? q : new Date().toISOString().slice(0, 7);
  const categories = db.prepare(`SELECT c.id,c.name,c.icon,c.color,c.budget,
    COALESCE((SELECT SUM(amount) FROM fin_entries e WHERE e.category_id=c.id AND substr(e.entry_date,1,7)=?),0) AS spent
    FROM fin_categories c ORDER BY c.id`).all(month).map(c => ({ ...c }));
  const entries = db.prepare(`SELECT id,category_id AS categoryId,amount,note,entry_date AS date FROM fin_entries
    WHERE substr(entry_date,1,7)=? ORDER BY entry_date DESC,id DESC`).all(month).map(e => ({ ...e }));
  return { month, ...getSettings(), categories, entries };
});

const catFields = (b) => {
  const name = String(b?.name || "").trim(), budget = num(b?.budget ?? 0);
  if (!name) return bad("Give the category a name");
  if (!(budget >= 0)) return bad("Budget must be a number, 0 or more");
  return { name, icon: b.icon || "💰", color: /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "#2f8f72", budget };
};
route("POST", "/api/finance/categories", ({ body }) => {
  const f = catFields(body); if (Array.isArray(f)) return f;
  const r = db.prepare("INSERT INTO fin_categories(name,icon,color,budget) VALUES(?,?,?,?)").run(f.name, f.icon, f.color, f.budget);
  return [201, { id: Number(r.lastInsertRowid), ...f }];
});
route("PUT", "/api/finance/categories/(\\d+)", ({ body, m }) => {
  const f = catFields(body); if (Array.isArray(f)) return f;
  db.prepare("UPDATE fin_categories SET name=?,icon=?,color=?,budget=? WHERE id=?").run(f.name, f.icon, f.color, f.budget, Number(m[1]));
  return { ok: true };
});
route("DELETE", "/api/finance/categories/(\\d+)", ({ m }) => {
  tx(() => { db.prepare("DELETE FROM fin_entries WHERE category_id=?").run(Number(m[1])); db.prepare("DELETE FROM fin_categories WHERE id=?").run(Number(m[1])); });
  return { ok: true };
});
route("POST", "/api/finance/entries", ({ body }) => {
  const { categoryId, note = "", date } = body || {}, amount = num(body?.amount);
  if (!(amount > 0)) return bad("Enter an amount above 0");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return bad("Pick a valid date");
  if (!db.prepare("SELECT 1 x FROM fin_categories WHERE id=?").get(Number(categoryId))) return bad("Pick a category");
  const r = db.prepare("INSERT INTO fin_entries(category_id,amount,note,entry_date) VALUES(?,?,?,?)").run(Number(categoryId), amount, String(note).trim(), date);
  return [201, { id: Number(r.lastInsertRowid) }];
});
route("DELETE", "/api/finance/entries/(\\d+)", ({ m }) => { db.prepare("DELETE FROM fin_entries WHERE id=?").run(Number(m[1])); return { ok: true }; });
route("PUT", "/api/finance/settings", ({ body }) => {
  const income = num(body?.income ?? 0);
  if (!(income >= 0)) return bad("Income must be 0 or more");
  setSetting("income", income); setSetting("currency", String(body?.currency || "₹").slice(0, 4));
  return { ok: true };
});

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const chunks = []; let size = 0;
    req.on("data", c => { size += c.length; if (size > 1e6) req.destroy(); else chunks.push(c); });
    req.on("end", () => {
      try {
        const hit = routes.find(([m, re]) => m === req.method && re.test(url.pathname));
        if (!hit) return send(res, 404, { error: "Not found" });
        let body = {}; const raw = Buffer.concat(chunks).toString();
        if (raw) { try { body = JSON.parse(raw); } catch { return send(res, 400, { error: "Invalid JSON" }); } }
        const out = hit[2]({ body, m: url.pathname.match(hit[1]), query: url.searchParams });
        Array.isArray(out) ? send(res, out[0], out[1]) : send(res, 200, out);
      } catch (e) { console.error(e); send(res, 500, { error: "Server error" }); }
    });
    return;
  }
  let file = path.join(FRONT, path.normalize(url.pathname === "/" ? "index.html" : url.pathname));
  if (!file.startsWith(FRONT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(FRONT, "index.html");
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

let port = Number(process.env.PORT) || 3000;
const start = (tries = 0) => {
  server.once("error", e => {
    if (e.code === "EADDRINUSE" && tries < 20) { port++; start(tries + 1); } else { console.error(e); process.exit(1); }
  });
  server.listen(port, "127.0.0.1", () => {
    const addr = `http://localhost:${port}`;
    console.log(`\nLifeOS is running at ${addr}\nYour data is saved in: ${DB_FILE}\nKeep this window open while using LifeOS (close it to stop).\n`);
    if (!process.env.NO_OPEN) exec(process.platform === "win32" ? `start "" ${addr}` : process.platform === "darwin" ? `open ${addr}` : `xdg-open ${addr}`);
  });
};
start();
