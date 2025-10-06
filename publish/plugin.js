function P() {
  const g = MusicKit.getInstance(), f = { blurPx: 32, dim: 0.35, vignette: 0.35 }, w = JSON.parse(localStorage.getItem("iab-settings") || "{}"), o = { ...f, ...w }, v = () => localStorage.setItem("iab-settings", JSON.stringify(o)), n = { style: "iab-style", layer: "iab-bg", panel: "iab-panel", btn: "iab-btn" }, p = (e) => document.getElementById(e);
  function $() {
    if (p(n.style)) return;
    const e = `
:root{
  --iab-blur:${o.blurPx}px; --iab-dim:${o.dim}; --iab-vignette:${o.vignette};
}
#${n.layer}{
  position:fixed; inset:0;
  background-size:cover; background-position:center;
  transform:scale(1.06);
  pointer-events:none; z-index:0;
  filter: blur(var(--iab-blur)) !important;
}
#${n.layer}::after{
  content:""; position:absolute; inset:0;
  background:
    radial-gradient(circle at 50% 50%,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,var(--iab-vignette)) 100%),
    rgba(0,0,0,var(--iab-dim));
}
#app{ position:relative; z-index:1; }

/* control button */
#${n.btn}{
  position:fixed; top:10px; right:86px;
  width:28px; height:28px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:rgba(30,30,30,.85); color:#fff; border:1px solid rgba(255,255,255,.12);
  cursor:pointer; z-index:2147483647; backdrop-filter:saturate(120%) blur(6px);
  -webkit-app-region:no-drag; pointer-events:auto;
}

/* responsive panel */
#${n.panel}{
  position:fixed; top:44px; right:20px;
  width:clamp(260px, 24vw, 360px); max-height:calc(100vh - 70px);
  overflow:auto;
  background:rgba(20,20,20,.92); color:#eee;
  border:1px solid rgba(255,255,255,.12); border-radius:10px;
  padding:12px; font:12px/1.3 -apple-system, system-ui, Segoe UI, Roboto, Arial;
  backdrop-filter:saturate(120%) blur(8px);
  z-index:2147483646; -webkit-app-region:no-drag; pointer-events:auto;
}
#${n.panel} h3{margin:0 0 8px; font:600 13px -apple-system,system-ui;}
#${n.panel} .row{
  display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px;
  margin:8px 0;
}
#${n.panel} .row label{white-space:nowrap;}
#${n.panel} .row input[type=range]{width:100%;}
#${n.panel} .row .val{min-width:48px; text-align:right; opacity:.9;}
#${n.panel} .reset{
  margin-top:10px;width:100%;padding:6px 0;border:none;border-radius:6px;
  background:#c62828;color:#fff;font-weight:600;cursor:pointer;
}
#${n.panel} .reset:hover{background:#b71c1c;}
`, t = document.createElement("style");
    t.id = n.style, t.textContent = e, document.head.appendChild(t);
  }
  function h() {
    if (p(n.layer)) return;
    const e = document.createElement("div");
    e.id = n.layer, document.body.prepend(e);
  }
  function E(e, t) {
    var r, s, a, i;
    return ((i = (a = (s = (r = e == null ? void 0 : e.attributes) == null ? void 0 : r.artwork) == null ? void 0 : s.url) == null ? void 0 : a.replace) == null ? void 0 : i.call(a, "{w}x{h}", `${t}x${t}`)) || "";
  }
  function C(e) {
    if (!e) return;
    h();
    const t = p(n.layer);
    t.style.backgroundImage = `url("${e}")`;
  }
  function u() {
    document.documentElement.style.setProperty("--iab-blur", `${o.blurPx}px`), document.documentElement.style.setProperty("--iab-dim", o.dim), document.documentElement.style.setProperty("--iab-vignette", o.vignette);
    const e = p(n.layer);
    e && (e.style.filter = `blur(${o.blurPx}px)`);
  }
  function x() {
    const e = E(g.nowPlayingItem, 2e3);
    C(e), u();
  }
  function y(e, t, r, s, a) {
    const i = document.createElement("div");
    i.className = "row";
    const c = document.createElement("label");
    c.textContent = e;
    const l = document.createElement("input");
    l.type = "range", l.min = t, l.max = r, l.step = s, l.value = o[a];
    const d = document.createElement("div");
    d.className = "val";
    const m = (b) => a === "blurPx" ? `${Math.round(b)}px` : (Math.round(b * 100) / 100).toString();
    return d.textContent = m(o[a]), l.oninput = (b) => {
      o[a] = parseFloat(b.target.value), v(), d.textContent = m(o[a]), u();
    }, i.append(c, l, d), i;
  }
  function k() {
    let e = p(n.btn);
    e || (e = document.createElement("button"), e.id = n.btn, e.title = "Immersive Art Settings", e.textContent = "🎨", ["mousedown", "click"].forEach((r) => e.addEventListener(r, (s) => s.stopPropagation())), document.body.appendChild(e));
    let t = p(n.panel);
    if (!t) {
      t = document.createElement("div"), t.id = n.panel, t.style.display = "none", ["mousedown", "click"].forEach((a) => t.addEventListener(a, (i) => i.stopPropagation()));
      const r = document.createElement("h3");
      r.textContent = "Immersive Art BG", t.appendChild(r), t.appendChild(y("Blur", 0, 100, 1, "blurPx")), t.appendChild(y("Dim", 0, 1, 0.01, "dim")), t.appendChild(y("Vignette", 0, 1, 0.01, "vignette"));
      const s = document.createElement("button");
      s.className = "reset", s.textContent = "Reset to Defaults", s.onclick = () => {
        Object.assign(o, f), v();
        const a = t.querySelectorAll(".row"), i = [o.blurPx, o.dim, o.vignette];
        a.forEach((c, l) => {
          const d = c.querySelector("input[type=range]"), m = c.querySelector(".val");
          d.value = i[l], m.textContent = l === 0 ? `${Math.round(i[l])}px` : Math.round(i[l] * 100) / 100;
        }), u();
      }, t.appendChild(s), document.body.appendChild(t);
    }
    e.onclick = () => {
      const r = p(n.panel);
      r.style.display = r.style.display === "none" ? "block" : "none";
    };
  }
  $(), h(), k(), u(), g.addEventListener("mediaItemDidChange", x), g.addEventListener("nowPlayingItemDidChange", x), x();
}
export {
  P as default
};
