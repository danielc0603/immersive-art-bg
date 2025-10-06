function h() {
  const x = MusicKit.getInstance(), w = { blurPx: 32, dim: 0.35, vignette: 0.35 }, E = JSON.parse(localStorage.getItem("iab-settings") || "{}"), n = { ...w, ...E }, y = () => localStorage.setItem("iab-settings", JSON.stringify(n)), a = { style: "iab-style", layer: "iab-bg", panel: "iab-panel", btn: "iab-btn" }, f = (e) => document.getElementById(e);
  function $() {
    if (f(a.style)) return;
    const e = `
:root{ --iab-blur:${n.blurPx}px; --iab-dim:${n.dim}; --iab-vignette:${n.vignette}; }
#${a.layer}{
  position:fixed; inset:0; background-size:cover; background-position:center;
  transform:scale(1.06); pointer-events:none; z-index:0;
  filter: blur(var(--iab-blur)) !important;
}
#${a.layer}::after{
  content:""; position:absolute; inset:0;
  background:
    radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,var(--iab-vignette)) 100%),
    rgba(0,0,0,var(--iab-dim));
}
#app{ position:relative; z-index:1; }
#${a.btn}{
  position:fixed; top:10px; right:86px; width:28px; height:28px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:rgba(30,30,30,.85); color:#fff; border:1px solid rgba(255,255,255,.12);
  cursor:pointer; z-index:2147483647; backdrop-filter:saturate(120%) blur(6px);
  -webkit-app-region:no-drag; pointer-events:auto;
}
#${a.panel}{
  position:fixed; top:44px; right:20px; width:clamp(260px,24vw,360px); max-height:calc(100vh - 70px); overflow:auto;
  background:rgba(20,20,20,.92); color:#eee; border:1px solid rgba(255,255,255,.12); border-radius:10px;
  padding:12px; font:12px/1.3 -apple-system,system-ui; backdrop-filter:saturate(120%) blur(8px);
  z-index:2147483646; -webkit-app-region:no-drag; pointer-events:auto; display:none;
}
#${a.panel} h3{margin:0 0 8px; font:600 13px -apple-system,system-ui;}
#${a.panel} .row{display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; margin:8px 0;}
#${a.panel} .row label{white-space:nowrap;}
#${a.panel} .row input[type=range]{width:100%;}
#${a.panel} .row .val{min-width:48px; text-align:right; opacity:.9;}
#${a.panel} .reset{ margin-top:10px; width:100%; padding:6px 0; border:none; border-radius:6px;
  background:#c62828; color:#fff; font-weight:600; cursor:pointer; }
#${a.panel} .reset:hover{ background:#b71c1c; }
`, t = document.createElement("style");
    t.id = a.style, t.textContent = e, document.head.appendChild(t);
  }
  function v() {
    if (f(a.layer)) return;
    const e = document.createElement("div");
    e.id = a.layer, document.body.prepend(e);
  }
  const C = (e, t) => {
    var d, l, o, r;
    return ((r = (o = (l = (d = e == null ? void 0 : e.attributes) == null ? void 0 : d.artwork) == null ? void 0 : l.url) == null ? void 0 : o.replace) == null ? void 0 : r.call(o, "{w}x{h}", `${t}x${t}`)) || "";
  };
  function I(e) {
    if (!e) return;
    v();
    const t = document.getElementById("iab-bg");
    t.style.backgroundImage = `url("${e}")`;
  }
  function p() {
    document.documentElement.style.setProperty("--iab-blur", `${n.blurPx}px`), document.documentElement.style.setProperty("--iab-dim", n.dim), document.documentElement.style.setProperty("--iab-vignette", n.vignette);
    const e = document.getElementById("iab-bg");
    e && (e.style.filter = `blur(${n.blurPx}px)`);
  }
  function b() {
    const e = C(MusicKit.getInstance().nowPlayingItem, 2e3);
    I(e), p();
  }
  function g(e, t, d, l, o) {
    const r = document.createElement("div");
    r.className = "row";
    const c = document.createElement("label");
    c.textContent = e;
    const i = document.createElement("input");
    i.type = "range", i.min = t, i.max = d, i.step = l, i.value = n[o];
    const s = document.createElement("div");
    s.className = "val";
    const u = (m) => o === "blurPx" ? `${Math.round(m)}px` : (Math.round(m * 100) / 100).toString();
    return s.textContent = u(n[o]), i.oninput = (m) => {
      n[o] = parseFloat(m.target.value), y(), s.textContent = u(n[o]), p();
    }, r.append(c, i, s), r;
  }
  function k() {
    let e = document.getElementById("iab-btn");
    e || (e = document.createElement("button"), e.id = "iab-btn", e.title = "Immersive Art Settings", e.textContent = "🎨", ["mousedown", "click"].forEach((d) => e.addEventListener(d, (l) => l.stopPropagation())), document.body.appendChild(e));
    let t = document.getElementById("iab-panel");
    if (!t) {
      t = document.createElement("div"), t.id = "iab-panel", ["mousedown", "click"].forEach((o) => t.addEventListener(o, (r) => r.stopPropagation()));
      const d = document.createElement("h3");
      d.textContent = "Immersive Art BG", t.appendChild(d), t.appendChild(g("Blur", 0, 100, 1, "blurPx")), t.appendChild(g("Dim", 0, 1, 0.01, "dim")), t.appendChild(g("Vignette", 0, 1, 0.01, "vignette"));
      const l = document.createElement("button");
      l.className = "reset", l.textContent = "Reset to Defaults", l.onclick = () => {
        Object.assign(n, { blurPx: 32, dim: 0.35, vignette: 0.35 }), y();
        const o = t.querySelectorAll(".row"), r = [n.blurPx, n.dim, n.vignette];
        o.forEach((c, i) => {
          const s = c.querySelector("input[type=range]"), u = c.querySelector(".val");
          s.value = r[i], u.textContent = i === 0 ? `${Math.round(r[i])}px` : Math.round(r[i] * 100) / 100;
        }), p();
      }, t.appendChild(l), document.body.appendChild(t);
    }
    e.onclick = () => {
      t.style.display = t.style.display === "none" || !t.style.display ? "block" : "none";
    };
  }
  $(), v(), k(), p(), x.addEventListener("mediaItemDidChange", b), x.addEventListener("nowPlayingItemDidChange", b), b();
}
h.identifier = "com.danielc0603.immersiveartbg";
h.meta = {
  identifier: "com.danielc0603.immersiveartbg",
  name: "Immersive Art BG",
  version: "1.1.2"
};
export {
  h as default
};
