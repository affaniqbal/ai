(function () {
  var items = (window.NOTES && window.NOTES.items) || [];
  var listEl = document.getElementById("list");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var searchEl = document.getElementById("search");
  var q = "";

  countEl.textContent = items.length + (items.length === 1 ? " item" : " items");
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function matches(it) {
    if (!q) return true;
    var hay = (it.title + " " + (it.tags || []).join(" ") + " " + (it.excerpt || "")).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function render() {
    var shown = items.filter(matches);
    listEl.innerHTML = "";
    emptyEl.hidden = shown.length > 0;
    shown.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "note-item";
      var isPdf = it.type === "pdf";
      var tagHtml = (it.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
      li.innerHTML =
        '<a class="t" href="' + it.url + '"' + (isPdf ? ' target="_blank" rel="noopener"' : "") + ">" + esc(it.title) + "</a>" +
        '<div class="meta"><span class="kind">' + (isPdf ? "PDF" : "note") + "</span>  ·  " + esc(it.date || "") +
          (tagHtml ? '  ·  <span class="tags">' + tagHtml + "</span>" : "") + "</div>" +
        (it.excerpt && !isPdf ? '<p class="excerpt">' + esc(it.excerpt) + "…</p>" : "");
      listEl.appendChild(li);
    });
  }

  searchEl.addEventListener("input", function () { q = searchEl.value.trim().toLowerCase(); render(); });
  render();
})();
