(async function () {
  const data = await (await fetch("data/data.json")).json();
  const S = data.statements;
  const actors = new Map(data.actors.map((a) => [a.code, a]));
  const groupName = new Map(data.groups.map((g) => [g.id, g.name]));
  const themeName = new Map(data.actionSituations.map((t) => [t.code, t.name]));
  const DEONTICS = ["Must", "May", "Must not"];
  const EXAMPLE_ID = "Wat_Code-2025-Art25-P1-S5";

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const short = (code) => (actors.get(code) || {}).short || code;
  const names = (codes) => codes.map(short).join(", ");
  const count = (items, key) => {
    const m = new Map();
    for (const it of items) for (const k of [].concat(key(it))) if (k) m.set(k, (m.get(k) || 0) + 1);
    return m;
  };
  const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);

  function bar(name, value, max, o = {}) {
    const tag = o.onclick ? "button" : "div";
    const g = o.group ? ` data-g="${o.group}"` : "";
    return `<${tag} class="bar${o.quiet ? " quiet" : ""}"${o.attrs || ""} title="${esc(o.title || name)}: ${value}">
      <span class="bar-name">${esc(name)}</span>
      <span class="bar-track"><span class="bar-fill"${g} style="width:calc(${max ? value / max : 0} * (100% - 44px))"></span><span class="bar-val">${value}</span></span>
    </${tag}>`;
  }
  const legend = (groups) =>
    groups.map((g) => `<li><span class="swatch" data-g="${g}"></span>${esc(groupName.get(g))}</li>`).join("");

  /* Counts used in the copy */
  const bySource = count(S, (s) => s.doc);
  const nums = { statements: S.length, wat: bySource.get("Wat_Code") || 0, eco: bySource.get("Eco_Code") || 0 };
  document.querySelectorAll("[data-n]").forEach((el) => (el.textContent = nums[el.dataset.n]));

  /* One rule, taken apart */
  const ex = S.find((s) => s.id === EXAMPLE_ID);
  if (ex) {
    $("ex-text").textContent = ex.text;
    const who = actors.get(ex.src[0]);
    const parts = [
      ["Who", "Attribute", esc(who ? who.name : ex.attr), ""],
      ["How binding", "Deontic", esc(ex.deontic), "must, may or must not"],
      ["Does what", "Aim", `<span lang="ru">${esc(ex.aim)}</span>`, "approve"],
      ["To what", "Object", `<span lang="ru">${esc(ex.object)}</span>`, "the groundwater abstraction project"],
      ["When", "Context", `<span lang="ru">${esc(ex.context)}</span>`, "above 1,000 cubic metres a day"],
      ["Aimed at", "Target", esc(names(ex.tgt)), ""],
      ["Theme", "Action situation", esc(themeName.get(ex.as) || ex.as), ""],
    ];
    $("ex-parts").innerHTML = parts
      .map(([k, term, v, gloss]) => `<div><dt>${k}<small>${term}</small></dt><dd>${v}${gloss ? `<small>${gloss}</small>` : ""}</dd></div>`)
      .join("");
  } else {
    $("anatomy").hidden = true;
  }

  /* Themes */
  let theme = "ALL";
  const themeCounts = count(S, (s) => s.as);
  const themeMax = Math.max(...data.actionSituations.map((t) => themeCounts.get(t.code) || 0));
  $("tabs").innerHTML = [["ALL", "All themes"], ...data.actionSituations.map((t) => [t.code, t.name])]
    .map(([c, n]) => `<button role="tab" data-theme="${c}" aria-controls="theme-panel">${esc(n)}</button>`)
    .join("");

  function renderTheme() {
    const t = data.actionSituations.find((x) => x.code === theme);
    const subset = t ? S.filter((s) => s.as === theme) : S;
    document.querySelectorAll("#tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.theme === theme));
    $("theme-count").textContent = subset.length;
    $("theme-name").textContent = t ? t.name : "All themes";
    $("theme-blurb").textContent = t ? t.blurb : "Every rule in the coding book.";
    $("bars-theme").innerHTML = data.actionSituations
      .map((x) => bar(x.name, themeCounts.get(x.code) || 0, themeMax, {
        quiet: t && x.code !== theme, onclick: true, attrs: ` data-theme="${x.code}" aria-pressed="${x.code === theme}"`,
      }))
      .join("");
    const d = count(subset, (s) => s.deontic);
    const dMax = Math.max(...DEONTICS.map((k) => d.get(k) || 0));
    $("bars-deontic").innerHTML = DEONTICS.map((k) => bar(k, d.get(k) || 0, dMax)).join("");
    const holders = top(count(subset, (s) => s.src), 7);
    $("bars-actors").innerHTML = holders.length
      ? holders.map(([c, n]) => bar(short(c), n, holders[0][1], { group: actors.get(c).group, title: actors.get(c).name })).join("")
      : `<p class="empty">No body is named for these rules.</p>`;
    $("legend-actors").innerHTML = legend([...new Set(holders.map(([c]) => actors.get(c).group))]);
  }
  $("themes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-theme]");
    if (!b) return;
    theme = b.dataset.theme === theme && b.classList.contains("bar") ? "ALL" : b.dataset.theme;
    renderTheme();
  });
  renderTheme();

  /* Findings */
  const d = count(S, (s) => s.deontic);
  const bwm = actors.get("BWM");
  const mvri = actors.get("MVRI");
  if (bwm && mvri) {
    $("finding-1").textContent = `${bwm.held} of ${S.length} rules sit with the basin offices`;
    $("finding-1-sub").textContent = `The Basin Water Management offices hold more rules than any ministry. The Water Ministry itself holds ${mvri.held}.`;
  }
  $("finding-2").textContent = `${d.get("Must") || 0} rules say must. ${d.get("May") || 0} say may.`;
  $("finding-2-sub").textContent = `Another ${d.get("Must not") || 0} are outright bans. Most of the law hands duties to named bodies.`;

  /* Network */
  const W = 1040, H = 760, EDGE_PAD = 172;
  const nodes = data.actors.map((a) => ({ ...a, total: a.held + a.targeted, r: 7 + Math.sqrt(a.held + a.targeted) * 1.7 }));
  const links = data.links.map((l) => ({ ...l }));
  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((n) => n.code)
      .distance((l) => 70 + (l.source.r + l.target.r) * 2.4)
      .strength((l) => Math.min(0.3, 0.03 + l.n / 140)))
    .force("charge", d3.forceManyBody().strength((n) => -260 - n.r * 22).distanceMax(460))
    .force("x", d3.forceX(W / 2).strength(0.035))
    .force("y", d3.forceY(H / 2).strength(0.06))
    .force("collide", d3.forceCollide((n) => n.r + (n.total < 8 ? 20 : 34)))
    .stop();
  for (let i = 0; i < 500; i++) {
    sim.tick();
    for (const n of nodes) {
      n.x = Math.max(EDGE_PAD, Math.min(W - EDGE_PAD, n.x));
      n.y = Math.max(n.r + 16, Math.min(H - n.r - 16, n.y));
    }
  }
  const svg = d3.select("#net").attr("viewBox", `0 0 ${W} ${H}`);
  svg.append("defs").append("marker")
    .attr("id", "arrow").attr("viewBox", "0 0 8 8").attr("refX", 7).attr("refY", 4)
    .attr("markerWidth", 7).attr("markerHeight", 7).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto")
    .append("path").attr("d", "M0,0.5L8,4L0,7.5z");
  const edge = svg.append("g").selectAll("path").data(links).join("path")
    .attr("class", "edge").attr("marker-end", "url(#arrow)")
    .attr("stroke-width", (l) => 0.8 + Math.sqrt(l.n) * 0.85)
    .attr("d", (l) => {
      const a = l.source, b = l.target, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      const ex = b.x - (dx / len) * (b.r + 5), ey = b.y - (dy / len) * (b.r + 5);
      const mx = (a.x + ex) / 2 - (dy / len) * 16, my = (a.y + ey) / 2 + (dx / len) * 16;
      return `M${a.x},${a.y}Q${mx},${my} ${ex},${ey}`;
    });
  const node = svg.append("g").selectAll("g").data(nodes).join("g")
    .attr("class", (n) => "node" + (n.total < 8 ? " minor" : ""))
    .attr("data-g", (n) => n.group)
    .attr("transform", (n) => `translate(${n.x},${n.y})`)
    .attr("tabindex", 0).attr("role", "button")
    .attr("aria-label", (n) => `${n.name}: holds ${n.held} rules, target of ${n.targeted}`);
  node.append("circle").attr("r", (n) => n.r);
  // Labels sit in their own top layer so circles never cover them.
  const right = (n) => n.x >= W / 2;
  const label = svg.append("g").attr("class", "labels").selectAll("text").data(nodes).join("text")
    .attr("class", (n) => (n.total < 8 ? "minor" : ""))
    .attr("x", (n) => n.x + (right(n) ? n.r + 6 : -n.r - 6)).attr("y", (n) => n.y).attr("dy", "0.35em")
    .attr("text-anchor", (n) => (right(n) ? "start" : "end"))
    .text((n) => n.short);

  const tip = $("tip");
  node.on("pointerenter", (e, n) => {
    tip.innerHTML = `<b>${esc(n.name)}</b>Holds ${n.held} rules, target of ${n.targeted}`;
    tip.hidden = false;
    const box = $("net").getBoundingClientRect(), k = box.width / W;
    tip.style.left = Math.min(n.x * k + 14, box.width - 270) + "px";
    tip.style.top = n.y * k + n.r * k + 10 + "px";
  }).on("pointerleave", () => (tip.hidden = true));
  node.on("click", (e, n) => { e.stopPropagation(); select(n.code); });
  node.on("keydown", (e, n) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.code); } });
  svg.on("click", () => select(null));

  function select(code) {
    const near = new Set(code ? [code] : []);
    for (const l of links) {
      if (l.source.code === code) near.add(l.target.code);
      if (l.target.code === code) near.add(l.source.code);
    }
    svg.classed("has-sel", !!code);
    node.classed("sel", (n) => n.code === code).classed("near", (n) => near.has(n.code));
    label.classed("sel", (n) => n.code === code).classed("near", (n) => near.has(n.code));
    edge.classed("near", (l) => l.source.code === code || l.target.code === code);
    renderDetail(code);
  }

  function renderDetail(code) {
    const a = actors.get(code);
    if (!a) {
      const lead = [...nodes].sort((x, y) => y.held - x.held).slice(0, 6);
      $("net-detail").innerHTML = `<h3>Select a body</h3>
        <p class="role">Circle size shows how many rules a body holds or receives. Line width shows how many rules run between two bodies.</p>
        <h4 style="margin-top:24px">Holding the most rules</h4>
        <div class="bars">${lead.map((n) => bar(n.short, n.held, lead[0].held, { group: n.group, onclick: true, attrs: ` data-actor="${esc(n.code)}"`, title: n.name })).join("")}</div>`;
      return;
    }
    const out = links.filter((l) => l.source.code === code).sort((x, y) => y.n - x.n).slice(0, 5);
    const inc = links.filter((l) => l.target.code === code).sort((x, y) => y.n - x.n).slice(0, 5);
    const list = (ls, end) => ls.length
      ? `<div class="bars">${ls.map((l) => bar(l[end].short, l.n, ls[0].n, { group: l[end].group, onclick: true, attrs: ` data-actor="${esc(l[end].code)}"`, title: l[end].name })).join("")}</div>`
      : `<p class="empty">None in the coding book.</p>`;
    $("net-detail").innerHTML = `<p class="group"><span class="swatch" data-g="${a.group}"></span>${esc(groupName.get(a.group))}</p>
      <h3>${esc(a.name)}</h3>
      ${a.role ? `<p class="role">${esc(a.role)}</p>` : ""}
      <div class="counts"><div><b>${a.held}</b><span>rules it holds</span></div><div><b>${a.targeted}</b><span>rules aimed at it</span></div></div>
      <h4>Aims its rules at</h4>${list(out, "target")}
      <h4 style="margin-top:22px">Receives rules from</h4>${list(inc, "source")}
      <a class="btn btn-mint" href="#rules" data-filter-actor="${esc(a.code)}">Read its rules</a>`;
  }
  $("net-detail").addEventListener("click", (e) => {
    const b = e.target.closest("[data-actor]");
    if (b) select(b.dataset.actor);
    const f = e.target.closest("[data-filter-actor]");
    if (f) setFilters({ actor: f.dataset.filterActor });
  });
  $("legend-net").innerHTML = legend(data.groups.map((g) => g.id));
  $("actor-table").innerHTML = `<thead><tr><th>Body</th><th>Group</th><th class="num">Rules it holds</th><th class="num">Rules aimed at it</th></tr></thead><tbody>${
    [...nodes].sort((x, y) => y.held - x.held || y.targeted - x.targeted)
      .map((n) => `<tr><td>${esc(n.name)}</td><td>${esc(groupName.get(n.group))}</td><td class="num">${n.held}</td><td class="num">${n.targeted}</td></tr>`).join("")
  }</tbody>`;
  select(null);

  /* Ministries */
  const plural = (name, n) => (n === 1 ? name : name + "s");
  let ministry = data.ministries[0].code;
  function renderMinistries() {
    $("min-buttons").innerHTML = data.ministries
      .map((m) => `<button role="tab" aria-controls="org" aria-selected="${m.code === ministry}" data-ministry="${m.code}">${esc(m.name)}<span>${m.units} units</span></button>`)
      .join("");
    const m = data.ministries.find((x) => x.code === ministry);
    const a = actors.get(m.code);
    $("org").innerHTML = `<div class="org-root"><h3>${esc(m.name)}</h3>
      <p>${m.units} units in ${m.bodies.length} branches${a ? `. Holds ${a.held} ${plural("rule", a.held)} in the coding book` : ""}.</p>
      <div class="org-stem"></div></div>
      <div class="org-bodies" style="--n:${m.bodies.length}">${m.bodies.map((b) => `<div class="org-body"><div>
        <h4>${esc(b.name)}</h4><p class="n">${b.units} ${plural("unit", b.units)}</p>
        ${b.categories.map((c) => `<details><summary>${esc(plural(c.name, c.units.length))}<b>${c.units.length}</b></summary><ul>${c.units.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></details>`).join("")}
      </div></div>`).join("")}</div>`;
  }
  $("min-buttons").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ministry]");
    if (!b) return;
    ministry = b.dataset.ministry;
    renderMinistries();
    $("min-buttons").querySelector('[aria-selected="true"]').focus();
  });
  renderMinistries();

  /* All rules */
  const PAGE = 12;
  let limit = PAGE;
  const option = (v, t) => `<option value="${esc(v)}">${esc(t)}</option>`;
  $("f-as").innerHTML = option("", "All themes") + data.actionSituations.map((t) => option(t.code, t.name)).join("");
  $("f-deontic").innerHTML = option("", "Any") + DEONTICS.map((k) => option(k, k)).join("");
  $("f-actor").innerHTML = option("", "All bodies") +
    [...data.actors].sort((x, y) => x.short.localeCompare(y.short)).map((a) => option(a.code, a.short)).join("");

  function renderRules() {
    const q = $("f-q").value.trim().toLowerCase();
    const as = $("f-as").value, de = $("f-deontic").value, ac = $("f-actor").value;
    const hits = S.filter((s) =>
      (!as || s.as === as) && (!de || s.deontic === de) &&
      (!ac || s.src.includes(ac) || s.tgt.includes(ac)) &&
      (!q || (s.text + " " + s.id + " " + s.object).toLowerCase().includes(q)));
    const shown = hits.slice(0, limit);
    $("rules-count").textContent = hits.length
      ? `Showing ${shown.length} of ${hits.length} matching ${plural("rule", hits.length)}`
      : "No rule matches these filters. Clear a filter to see more.";
    $("rule-list").innerHTML = shown.map((s) => {
      const who = s.src.length ? esc(names(s.src)) : "No body named";
      const deon = s.deontic ? `<span class="deontic" data-d="${s.deontic}">${s.deontic}</span>` : "";
      const to = s.tgt.length ? ` → ${esc(names(s.tgt))}` : "";
      const parts = [["Statement", s.id], ["Aim", s.aim], ["Object", s.object], ["Context", s.context], ["Rule type", [s.ruleType, s.ostrom].filter(Boolean).join(", ")]]
        .filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd${k === "Statement" || k === "Rule type" ? "" : ' lang="ru"'}>${esc(v)}</dd>`).join("");
      return `<li><details><summary>
        <div class="rule-meta"><b>${s.art ? "Article " + s.art : "No article"}</b>${esc(data.sources[s.doc] || s.doc)}<br>${esc(themeName.get(s.as) || "No theme")}</div>
        <div><p class="rule-who">${who} ${deon}${to}</p><p class="rule-text" lang="ru">${esc(s.text)}</p></div>
      </summary><dl class="rule-parts">${parts}</dl></details></li>`;
    }).join("");
    $("more").hidden = hits.length <= limit;
  }
  function setFilters(f) {
    $("f-q").value = f.q || "";
    $("f-as").value = f.as || "";
    $("f-deontic").value = f.deontic || "";
    $("f-actor").value = f.actor || "";
    limit = PAGE;
    renderRules();
  }
  $("filters").addEventListener("input", () => { limit = PAGE; renderRules(); });
  $("f-reset").addEventListener("click", () => setFilters({}));
  $("more").addEventListener("click", () => { limit += PAGE; renderRules(); });
  renderRules();

  /* Links from the finding cards */
  document.querySelectorAll("[data-select]").forEach((el) => el.addEventListener("click", () => select(el.dataset.select)));
  document.querySelectorAll("[data-deontic]").forEach((el) => el.addEventListener("click", () => setFilters({ deontic: el.dataset.deontic })));
})();
