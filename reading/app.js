(function () {
  var entries = window.READING.entries;
  var byId = {};
  entries.forEach(function (e) { byId[e.id] = e; });

  var typeLabel = { arxiv: "arXiv", web: "web", book: "book", screenshot: "screenshot" };

  // ---- Count ----
  document.getElementById("count").textContent = entries.length + " entries";

  // ---- Build graph data: entry nodes + tag nodes ----
  var nodes = [], links = [], tagSeen = {};
  entries.forEach(function (e) {
    nodes.push({ id: e.id, kind: "entry", label: e.title, entry: e });
    e.tags.forEach(function (t) {
      if (!tagSeen[t]) { tagSeen[t] = true; nodes.push({ id: "tag:" + t, kind: "tag", label: t }); }
      links.push({ source: e.id, target: "tag:" + t });
    });
  });

  var svg = d3.select("#graph");
  var frame = document.querySelector(".graph-frame");
  var W = frame.clientWidth, H = frame.clientHeight;
  svg.attr("viewBox", "0 0 " + W + " " + H);

  var link = svg.append("g").selectAll("line").data(links).enter()
    .append("line").attr("class", "link-line");

  var node = svg.append("g").selectAll("g").data(nodes).enter().append("g");

  node.append("circle")
    .attr("class", function (d) { return d.kind === "entry" ? "node-entry" : "node-tag"; })
    .attr("r", function (d) { return d.kind === "entry" ? 7 : 4; });

  node.append("text")
    .attr("class", function (d) { return d.kind === "entry" ? "node-label" : "tag-label"; })
    .attr("x", function (d) { return d.kind === "entry" ? 11 : 7; })
    .attr("dy", "0.32em")
    .text(function (d) { return d.kind === "entry" ? shorten(d.label) : d.label; });

  function shorten(s) { return s.length > 30 ? s.slice(0, 28) + "…" : s; }

  var sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(70).strength(0.7))
    .force("charge", d3.forceManyBody().strength(-240))
    .force("center", d3.forceCenter(W / 2, H / 2))
    .force("collide", d3.forceCollide(26))
    .on("tick", tick);

  function tick() {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
    node.attr("transform", function (d) {
      d.x = Math.max(14, Math.min(W - 14, d.x));
      d.y = Math.max(14, Math.min(H - 14, d.y));
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  node.call(d3.drag()
    .on("start", function (ev, d) { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on("drag", function (ev, d) { d.fx = ev.x; d.fy = ev.y; })
    .on("end", function (ev, d) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  // Hover highlight + click to open
  node.on("mouseenter", function (ev, d) { highlight(d); })
      .on("mouseleave", clearHighlight)
      .on("click", function (ev, d) { if (d.kind === "entry") openEntry(d.entry); });

  function neighbours(d) {
    var set = {}; set[d.id] = true;
    links.forEach(function (l) {
      if (l.source.id === d.id) set[l.target.id] = true;
      if (l.target.id === d.id) set[l.source.id] = true;
    });
    return set;
  }
  function highlight(d) {
    var keep = neighbours(d);
    node.selectAll("circle").classed("dim", function (n) { return !keep[n.id]; });
    node.selectAll("text").style("opacity", function (n) { return keep[n.id] ? 1 : 0.18; });
    link.classed("hot", function (l) { return l.source.id === d.id || l.target.id === d.id; })
        .classed("dim", function (l) { return !(l.source.id === d.id || l.target.id === d.id); });
  }
  function clearHighlight() {
    node.selectAll("circle").classed("dim", false);
    node.selectAll("text").style("opacity", 1);
    link.classed("hot", false).classed("dim", false);
  }

  // ---- Entry list ----
  var list = document.getElementById("list");
  entries.forEach(function (e) {
    var li = document.createElement("li");
    li.className = "entry-row";
    li.innerHTML =
      '<span class="etype">' + (typeLabel[e.type] || e.type) + '</span>' +
      '<span class="etitle">' + e.title + '</span>' +
      '<span class="etags">' + e.tags.slice(0, 2).join(" · ") + '</span>' +
      '<span class="edate">' + e.date + '</span>';
    li.addEventListener("click", function () { openEntry(e); });
    list.appendChild(li);
  });

  // ---- Drawer ----
  var scrim = document.getElementById("scrim");
  var drawer = document.getElementById("drawer");
  var inner = document.getElementById("drawer-inner");

  function openEntry(e) {
    var linkBtns = (e.links || []).map(function (id) {
      var t = byId[id]; if (!t) return "";
      return '<button data-id="' + id + '">' + shorten(t.title) + '</button>';
    }).join("");

    inner.innerHTML =
      '<button class="close" id="close">close ✕</button>' +
      '<div class="step">1 · source</div>' +
      '<h2>' + e.title + '</h2>' +
      '<div class="src">' + (e.url
        ? '<a class="chip" href="' + e.url + '">' + (e.source || e.url) + '</a>'
        : '<span class="chip">' + e.source + '</span>') + '</div>' +
      '<div class="step">2 · artefact</div>' +
      '<div class="artefact">' + artefactLabel(e) + '</div>' +
      '<div class="step">3 · analysis</div>' +
      '<p>' + e.summary + '</p>' +
      '<ul class="claims">' + e.claims.map(function (c) { return '<li>' + c + '</li>'; }).join("") + '</ul>' +
      '<div class="step">4 · my comment</div>' +
      '<p class="comment">' + e.comment + '</p>' +
      '<div class="step">5 · linked to</div>' +
      '<div class="linkchips">' + (linkBtns || '<span class="src">nothing yet</span>') + '</div>';

    inner.querySelector("#close").addEventListener("click", close);
    inner.querySelectorAll(".linkchips button").forEach(function (b) {
      b.addEventListener("click", function () { openEntry(byId[b.getAttribute("data-id")]); });
    });

    scrim.classList.add("open");
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.scrollTop = 0;
  }
  function artefactLabel(e) {
    if (e.type === "arxiv") return "▤  stored PDF · " + (e.source || "arXiv");
    if (e.type === "screenshot") return "▣  stored screenshot";
    if (e.type === "book") return "▤  reference · " + (e.source || "book");
    return "▢  page snapshot · " + (e.source || e.url);
  }
  function close() {
    scrim.classList.remove("open");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
})();
