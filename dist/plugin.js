function C() {
  let x = !1, u, g;
  const y = { blurPx: 32, dim: 0.35, vignette: 0.35 }, E = JSON.parse(localStorage.getItem("iab-settings") || "{}"), i = { ...y, ...E }, v = () => localStorage.setItem("iab-settings", JSON.stringify(i)), o = { style: "iab-style", layer: "iab-bg", panel: "iab-panel", btn: "iab-btn" }, c = (t) => document.getElementById(t);
  function k() {
    try {
      return !window.MusicKit || !MusicKit.getInstance ? !1 : (u = MusicKit.getInstance(), !!u && document.readyState !== "loading" && document.body);
    } catch {
      return !1;
    }
  }
  function I() {
    if (c(o.style)) return;
    const t = `
:root{ --iab-blur:${i.blurPx}px; --iab-dim:${i.dim}; --iab-vignette:${i.vignette}; }
#${o.layer}{
  position:fixed; inset:0; background-size:cover; background-position:center;
  transform:scale(1.06); pointer-events:none; z-index:0;
  filter:blur(var(--iab-blur)) !important;
}
#${o.layer}::after{
  content:""; position:absolute; inset:0;
  background:
    radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,var(--iab-vignette)) 100%),
    rgba(0,0,0,var(--iab-dim));
}
#${o.btn}{
  position:fixed; top:10px; right:86px; width:28px; height:28px;
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  background:rgba(30,30,30,.85); color:#fff; border:1px solid rgba(255,255,255,.12);
  cursor:pointer; z-index:2147483647; backdrop-filter:saturate(120%) blur(6px);
  -webkit-app-region:no-drag; pointer-events:auto;
}
#${o.btn}.dock{position:static;margin-left:8px;width:26px;height:26px;border-radius:6px;background:rgba(40,40,40,.85);}
#${o.panel}{
  position:fixed;
  width:clamp(260px,24vw,360px); max-height:calc(100vh - 70px); overflow:auto;
  background:rgba(20,20,20,.92); color:#eee; border:1px solid rgba(255,255,255,.12);
  border-radius:10px; padding:12px; font:12px/1.3 -apple-system,system-ui;
  backdrop-filter:saturate(120%) blur(8px);
  z-index:2147483646; pointer-events:auto; display:none;
  box-shadow:0 10px 30px rgba(0,0,0,.35);
  cursor:grab;
}
#${o.panel}:active { cursor:grabbing; }
#${o.panel} h3{margin:0 0 8px; font:600 13px -apple-system,system-ui;}
#${o.panel} .row{display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; margin:8px 0;}
#${o.panel} .row input[type=range]{width:100%;}
#${o.panel} .row .val{min-width:48px; text-align:right; opacity:.9;}
#${o.panel} .reset{ margin-top:10px; width:100%; padding:6px 0; border:none; border-radius:6px;
  background:#c62828; color:#fff; font-weight:600; cursor:pointer; }
`, e = document.createElement("style");
    e.id = o.style, e.textContent = t, document.head.appendChild(e);
  }
  function w() {
    if (!c(o.layer)) {
      const t = document.createElement("div");
      t.id = o.layer, document.body.prepend(t);
    }
  }
  const M = (t, e) => {
    var a, r, n, s;
    return ((s = (n = (r = (a = t == null ? void 0 : t.attributes) == null ? void 0 : a.artwork) == null ? void 0 : r.url) == null ? void 0 : n.replace) == null ? void 0 : s.call(n, "{w}x{h}", `${e}x${e}`)) || "";
  };
  function S(t) {
    t && (w(), c(o.layer).style.backgroundImage = `url("${t}")`);
  }
  function m() {
    document.documentElement.style.setProperty("--iab-blur", `${i.blurPx}px`), document.documentElement.style.setProperty("--iab-dim", i.dim), document.documentElement.style.setProperty("--iab-vignette", i.vignette);
    const t = c(o.layer);
    t && (t.style.filter = `blur(${i.blurPx}px)`);
  }
  function b() {
    S(M(MusicKit.getInstance().nowPlayingItem, 2e3)), m();
  }
  function h(t, e, a, r, n) {
    const s = document.createElement("div");
    s.className = "row";
    const l = document.createElement("label");
    l.textContent = t;
    const d = document.createElement("input");
    d.type = "range", d.min = e, d.max = a, d.step = r, d.value = i[n];
    const p = document.createElement("div");
    p.className = "val";
    const $ = (f) => n === "blurPx" ? `${Math.round(f)}px` : Math.round(f * 100) / 100;
    return p.textContent = $(i[n]), d.oninput = (f) => {
      i[n] = parseFloat(f.target.value), v(), p.textContent = $(i[n]), m();
    }, s.append(l, d, p), s;
  }
  const P = [
    'header [role="toolbar"]',
    "header .toolbar, header .topbar, header .window-toolbar",
    ".titlebar .right, #titlebar .right",
    'header [data-region="window-controls"] ~ div',
    ".quick-actions, .header-actions"
  ], L = () => P.map((t) => document.querySelector(t)).find(Boolean) || null;
  function B(t) {
    const e = L();
    return e ? (t.parentElement !== e && e.appendChild(t), t.classList.add("dock"), !0) : (t.parentElement !== document.body && document.body.appendChild(t), t.classList.remove("dock"), !1);
  }
  function N(t) {
    const a = window.innerWidth, r = window.innerHeight;
    let n = JSON.parse(localStorage.getItem("iab-panel-pos") || "null");
    if (!n) {
      const s = c(o.btn);
      if (s) {
        const l = s.getBoundingClientRect();
        n = { left: Math.min(a - 300, l.right - 280), top: l.bottom + 10 };
      } else
        n = { left: a - 360, top: 50 };
    }
    n.left = Math.min(a - t.offsetWidth - 12, Math.max(12, n.left)), n.top = Math.min(r - t.offsetHeight - 12, Math.max(12, n.top)), t.style.left = `${n.left}px`, t.style.top = `${n.top}px`, localStorage.setItem("iab-panel-pos", JSON.stringify(n));
  }
  function O(t) {
    let e = !1, a = 0, r = 0;
    t.addEventListener("mousedown", (n) => {
      n.target.closest("input,button") || (e = !0, a = n.clientX - t.offsetLeft, r = n.clientY - t.offsetTop, t.style.cursor = "grabbing", n.preventDefault());
    }), document.addEventListener("mousemove", (n) => {
      if (!e) return;
      let s = n.clientX - a, l = n.clientY - r;
      const d = window.innerWidth, p = window.innerHeight;
      s = Math.min(d - t.offsetWidth, Math.max(0, s)), l = Math.min(p - t.offsetHeight, Math.max(0, l)), t.style.left = `${s}px`, t.style.top = `${l}px`;
    }), document.addEventListener("mouseup", () => {
      e && (e = !1, t.style.cursor = "grab", localStorage.setItem("iab-panel-pos", JSON.stringify({ left: t.offsetLeft, top: t.offsetTop })));
    });
  }
  function D() {
    let t = c(o.btn);
    t || (t = document.createElement("button"), t.id = o.btn, t.title = "Immersive Art Settings", t.textContent = "🎨", document.body.appendChild(t));
    let e = c(o.panel);
    if (!e) {
      e = document.createElement("div"), e.id = o.panel;
      const a = document.createElement("h3");
      a.textContent = "Immersive Art BG", e.appendChild(a), e.appendChild(h("Blur", 0, 100, 1, "blurPx")), e.appendChild(h("Dim", 0, 1, 0.01, "dim")), e.appendChild(h("Vignette", 0, 1, 0.01, "vignette"));
      const r = document.createElement("button");
      r.className = "reset", r.textContent = "Reset to Defaults", r.onclick = () => {
        Object.assign(i, y), v(), m();
      }, e.appendChild(r), document.body.appendChild(e), O(e);
    }
    t.onclick = () => {
      const a = e.style.display !== "block";
      e.style.display = a ? "block" : "none", a && N(e);
    }, B(t);
  }
  function A() {
    if (!x) {
      x = !0, I(), w(), D(), m();
      try {
        u.addEventListener("mediaItemDidChange", b), u.addEventListener("nowPlayingItemDidChange", b);
      } catch {
      }
      b();
    }
  }
  return g = setInterval(() => {
    k() && (clearInterval(g), A());
  }, 250), {
    onClose() {
      try {
        clearInterval(g);
      } catch {
      }
    }
  };
}
C.identifier = "com.danielc0603.immersiveartbg";
C.meta = { identifier: "com.danielc0603.immersiveartbg", name: "Immersive Art BG", version: "1.4.0" };
export {
  C as default
};
