// Turns the notes/ folder (your .md and .pdf files) into the published site:
// renders each Markdown note into a styled page, lists PDFs, and builds the index.
// The .md/.pdf files are the source of truth; this just renders them.
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const ROOT = path.resolve(__dirname, "..");
const NOTES = path.join(ROOT, "notes");

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "note"; }
function pretty(name) { return name.replace(/[-_]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
function excerpt(md) { return md.replace(/[#>*`_\[\]!()\-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 160); }
function parseFM(md) {
  let fm = {}, body = md;
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (m) {
    body = m[2];
    m[1].split(/\r?\n/).forEach(function (l) {
      const mm = l.match(/^(\w+):\s*(.*)$/);
      if (!mm) return;
      let k = mm[1], v = mm[2].trim();
      if (k === "tags") v = v.replace(/^\[|\]$/g, "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      fm[k] = v;
    });
  }
  return { fm: fm, body: body };
}
function page(title, date, tags, contentHtml) {
  const tagline = (tags && tags.length) ? (" · " + tags.join(" · ")) : "";
  return '<!DOCTYPE html>\n<html lang="en"><head>\n' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "<title>" + esc(title) + " · Affan Iqbal</title>\n" +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aaaakshat/cm-web-fonts@latest/fonts.css">\n' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&display=swap">\n' +
    '<link rel="stylesheet" href="../style.css">\n<link rel="stylesheet" href="notes.css">\n' +
    "</head><body><div class=\"wrap\">\n" +
    '<nav class="topnav"><a class="chip" href="./">&larr; Notes</a><a class="chip" href="../">Affan Iqbal</a></nav>\n' +
    '<article class="note">\n<h1>' + esc(title) + "</h1>\n" +
    '<p class="note-meta">' + esc(date || "") + esc(tagline) + "</p>\n" +
    contentHtml + "\n</article>\n</div>\n" +
    '<footer style="text-align:center;padding:56px 0 40px;font-size:12px;color:var(--muted)">Affan Iqbal &copy; 2026</footer>\n' +
    "</body></html>\n";
}

function isNote(f) { return /\.md$/i.test(f) && !f.startsWith("_") && f.toLowerCase() !== "readme.md"; }

// each note's page is named after its file; check the names before touching anything
const slugs = {};
const problems = [];
fs.readdirSync(NOTES).filter(isNote).forEach(function (f) {
  const slug = slugify(f.replace(/\.md$/i, ""));
  if (slug === "index") problems.push(f + " would overwrite the notes index page. Rename the file.");
  else if (slugs[slug]) problems.push(f + " and " + slugs[slug] + " would both become " + slug + ".html. Rename one of them.");
  else slugs[slug] = f;
});
if (problems.length) {
  console.error("Could not build notes:\n  " + problems.join("\n  "));
  process.exit(1);
}

// clear previously generated note pages (keep index.html)
fs.readdirSync(NOTES).filter(function (f) { return /\.html$/i.test(f) && f !== "index.html"; })
  .forEach(function (f) { fs.unlinkSync(path.join(NOTES, f)); });

const items = [];
fs.readdirSync(NOTES).forEach(function (f) {
  const full = path.join(NOTES, f);
  if (isNote(f)) {
    const raw = fs.readFileSync(full, "utf8").replace(/^﻿/, "");
    const p = parseFM(raw);
    const h1 = p.body.match(/^#\s+(.+)$/m);
    const title = p.fm.title || (h1 ? h1[1].trim() : pretty(f.replace(/\.md$/, "")));
    const date = p.fm.date || fs.statSync(full).mtime.toISOString().slice(0, 10);
    const slug = slugify(f.replace(/\.md$/i, ""));
    const renderBody = p.body.replace(/^\s*#\s+.*(?:\r?\n)+/, "");
    fs.writeFileSync(path.join(NOTES, slug + ".html"), page(title, date, p.fm.tags || [], marked.parse(renderBody)));
    items.push({ type: "note", title: title, url: slug + ".html", date: date, tags: p.fm.tags || [], excerpt: excerpt(renderBody) });
  } else if (/\.pdf$/i.test(f)) {
    items.push({ type: "pdf", title: pretty(f.replace(/\.pdf$/i, "")), url: encodeURIComponent(f), date: fs.statSync(full).mtime.toISOString().slice(0, 10), tags: [], excerpt: "PDF document" });
  }
});
items.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
fs.writeFileSync(path.join(NOTES, "data.js"), "window.NOTES = " + JSON.stringify({ items: items }, null, 2) + ";\n");
console.log("Wrote notes/data.js with " + items.length + " item(s); rendered note pages.");
