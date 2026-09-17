(function () {
  var items = (window.LINKS && window.LINKS.items) || [];
  var state = { q: "", tag: null };

  var listEl = document.getElementById("list");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var searchEl = document.getElementById("search");
  var tagbarEl = document.getElementById("tagbar");

  countEl.textContent = items.length + (items.length === 1 ? " link" : " links");

  // tag bar
  var tags = {};
  items.forEach(function (it) { (it.tags || []).forEach(function (t) { tags[t] = (tags[t] || 0) + 1; }); });
  var tagNames = Object.keys(tags).sort();
  function renderTagbar() {
    tagbarEl.innerHTML = "";
    var all = document.createElement("button");
    all.textContent = "all";
    all.className = state.tag ? "" : "on";
    all.onclick = function () { state.tag = null; render(); };
    tagbarEl.appendChild(all);
    tagNames.forEach(function (t) {
      var b = document.createElement("button");
      b.textContent = t + " · " + tags[t];
      b.className = state.tag === t ? "on" : "";
      b.onclick = function () { state.tag = (state.tag === t ? null : t); render(); };
      tagbarEl.appendChild(b);
    });
  }

  function matches(it) {
    if (state.tag && (it.tags || []).indexOf(state.tag) === -1) return false;
    if (state.q) {
      var hay = (it.title + " " + (it.tags || []).join(" ") + " " + it.notesHtml + " " + it.domain).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function render() {
    renderTagbar();
    var shown = items.filter(matches);
    listEl.innerHTML = "";
    emptyEl.hidden = shown.length > 0;
    shown.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "link-item";
      var tagHtml = (it.tags || []).map(function (t) { return '<button data-tag="' + t + '">' + t + "</button>"; }).join("");
      function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
      li.innerHTML =
        '<div class="head">' +
          '<a class="title" href="' + it.url + '" target="_blank" rel="noopener">' + it.title + "</a>" +
          '<span class="date">' + (it.date || "") + "</span>" +
        "</div>" +
        '<div class="meta">' + (it.domain || "") + (it.status ? '  ·  <span class="status">' + it.status + "</span>" : "") + "</div>" +
        (tagHtml ? '<div class="tags">' + tagHtml + "</div>" : "") +
        (it.summary ? '<p class="summary">' + esc(it.summary) + "</p>" : "") +
        (it.notesHtml ? '<div class="notes">' + it.notesHtml + "</div>" : "");
      li.querySelectorAll(".tags button").forEach(function (b) {
        b.onclick = function () { state.tag = b.getAttribute("data-tag"); render(); window.scrollTo({ top: 0, behavior: "smooth" }); };
      });
      listEl.appendChild(li);
    });
  }

  searchEl.addEventListener("input", function () { state.q = searchEl.value.trim().toLowerCase(); render(); });
  render();
})();
