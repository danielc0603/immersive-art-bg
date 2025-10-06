function J() {
  let $ = !1, p, x, m, b;
  const k = { blurPx: 32, dim: 0.35, vignette: 0.35 }, M = JSON.parse(localStorage.getItem("iab-settings") || "{}"), s = { ...k, ...M }, E = () => localStorage.setItem("iab-settings", JSON.stringify(s)), o = { style: "iab-style", layer: "iab-bg", panel: "iab-panel", btn: "iab-btn" }, c = (t) => document.getElementById(t);
  function S() {
    try {
      return !window.MusicKit || !MusicKit.getInstance ? !1 : (p = MusicKit.getInstance(), !!p && document.readyState !== "loading" && document.body);
    } catch {
      return !1;
    }
  }
  function P() {
    if (c(o.style)) return;
    const t = `
:root{ --iab-blur:${s.blurPx}px; --iab-dim:${s.dim}; --iab-vignette:${s.vignette}; }
#${o.layer}{ position:fixed; inset:0; background-size:cover; background-position:center;
  transform:scale(1.06); pointer-events:none; z-index:0; filter:blur(var(--iab-blur)) !important; }
#${o.layer}::after{ content:""; position:absolute; inset:0;
  background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,var(--iab-vignette)) 100%), rgba(0,0,0,var(--iab-dim)); }

#${o.btn}{ position:fixed; top:10px; right:86px; width:28px; height:28px; border-radius:50%;
  display:flex; align-items:center; justify-content:center; background:rgba(30,30,30,.85); color:#fff;
  border:1px solid rgba(255,255,255,.12); cursor:pointer; z-index:2147483647; backdrop-filter:saturate(120%) blur(6px);
  -webkit-app-region:no-drag; pointer-events:auto; }
#${o.btn}.dock{ position:static; right:auto; top:auto; margin-left:8px; width:26px; height:26px; border-radius:6px; background:rgba(40,40,40,.85); }

#${o.panel}{ position:fixed; width:clamp(260px,24vw,360px); max-height:calc(100vh - 70px); overflow:auto;
  background:rgba(20,20,20,.92); color:#eee; border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:12px;
  font:12px/1.3 -apple-system,system-ui; backdrop-filter:saturate(120%) blur(8px); z-index:2147483646;
  -webkit-app-region:no-drag; pointer-events:auto; display:none; box-shadow:0 10px 30px rgba(0,0,0,.35); cursor:grab; }
#${o.panel}:active{ cursor:grabbing; }
#${o.panel} h3{ margin:0 0 8px; font:600 13px -apple-system,system-ui; }
#${o.panel} .row{ display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; margin:8px 0; }
#${o.panel} .row input[type=range]{ width:100%; }
#${o.panel} .row .val{ min-width:48px; text-align:right; opacity:.9; }
#${o.panel} .reset{ margin-top:10px; width:100%; padding:6px 0; border:none; border-radius:6px; background:#c62828; color:#fff; font-weight:600; cursor:pointer; }
`, e = document.createElement("style");
    e.id = o.style, e.textContent = t, document.head.appendChild(e);
  }
  function C() {
    if (!c(o.layer)) {
      const t = document.createElement("div");
      t.id = o.layer, document.body.prepend(t);
    }
  }
  const L = (t, e) => {
    var r, a, n, i;
    return ((i = (n = (a = (r = t == null ? void 0 : t.attributes) == null ? void 0 : r.artwork) == null ? void 0 : a.url) == null ? void 0 : n.replace) == null ? void 0 : i.call(n, "{w}x{h}", `${e}x${e}`)) || "";
  };
  function B(t) {
    t && (C(), c(o.layer).style.backgroundImage = `url("${t}")`);
  }
  function f() {
    document.documentElement.style.setProperty("--iab-blur", `${s.blurPx}px`), document.documentElement.style.setProperty("--iab-dim", s.dim), document.documentElement.style.setProperty("--iab-vignette", s.vignette);
    const t = c(o.layer);
    t && (t.style.filter = `blur(${s.blurPx}px)`);
  }
  function y() {
    B(L(MusicKit.getInstance().nowPlayingItem, 2e3)), f();
  }
  function v(t, e, r, a, n) {
    const i = document.createElement("div");
    i.className = "row";
    const d = document.createElement("label");
    d.textContent = t;
    const l = document.createElement("input");
    l.type = "range", l.min = e, l.max = r, l.step = a, l.value = s[n];
    const u = document.createElement("div");
    u.className = "val";
    const g = (h) => n === "blurPx" ? `${Math.round(h)}px` : Math.round(h * 100) / 100;
    return u.textContent = g(s[n]), l.oninput = (h) => {
      s[n] = parseFloat(h.target.value), E(), u.textContent = g(s[n]), f();
    }, i.append(d, l, u), i;
  }
  const O = [
    'header [role="toolbar"]',
    "header .toolbar, header .topbar, header .window-toolbar",
    ".titlebar .right, #titlebar .right",
    'header [data-region="window-controls"] ~ div',
    ".quick-actions, .header-actions"
  ], N = () => O.map((t) => document.querySelector(t)).find(Boolean) || null;
  function I(t) {
    const e = N();
    return e ? (t.parentElement !== e && e.appendChild(t), t.classList.add("dock"), !0) : (t.parentElement !== document.body && document.body.appendChild(t), t.classList.remove("dock"), !1);
  }
  function w(t) {
    const r = window.innerWidth, a = window.innerHeight;
    let n = JSON.parse(localStorage.getItem("iab-panel-pos") || "null");
    if (!n) {
      const i = c(o.btn);
      if (i) {
        const d = i.getBoundingClientRect();
        n = { left: Math.min(r - 300, d.right - 280), top: d.bottom + 10 };
      } else
        n = { left: r - 360, top: 50 };
    }
    n.left = Math.min(r - t.offsetWidth - 12, Math.max(12, n.left)), n.top = Math.min(a - t.offsetHeight - 12, Math.max(12, n.top)), t.style.left = `${n.left}px`, t.style.top = `${n.top}px`, localStorage.setItem("iab-panel-pos", JSON.stringify(n));
  }
  function D(t) {
    let e = !1, r = 0, a = 0;
    t.addEventListener("mousedown", (n) => {
      n.target.closest("input,button") || (e = !0, r = n.clientX - t.offsetLeft, a = n.clientY - t.offsetTop, t.style.cursor = "grabbing", n.preventDefault());
    }), document.addEventListener("mousemove", (n) => {
      if (!e) return;
      let i = n.clientX - r, d = n.clientY - a;
      const l = window.innerWidth, u = window.innerHeight;
      i = Math.min(l - t.offsetWidth, Math.max(0, i)), d = Math.min(u - t.offsetHeight, Math.max(0, d)), t.style.left = `${i}px`, t.style.top = `${d}px`;
    }), document.addEventListener("mouseup", () => {
      e && (e = !1, t.style.cursor = "grab", localStorage.setItem("iab-panel-pos", JSON.stringify({ left: t.offsetLeft, top: t.offsetTop })));
    });
  }
  function A() {
    let t = c(o.btn);
    t || (t = document.createElement("button"), t.id = o.btn, t.title = "Immersive Art Settings", t.textContent = "🎨", document.body.appendChild(t));
    let e = c(o.panel);
    if (!e) {
      e = document.createElement("div"), e.id = o.panel;
      const r = document.createElement("h3");
      r.textContent = "Immersive Art BG", e.appendChild(r), e.appendChild(v("Blur", 0, 100, 1, "blurPx")), e.appendChild(v("Dim", 0, 1, 0.01, "dim")), e.appendChild(v("Vignette", 0, 1, 0.01, "vignette"));
      const a = document.createElement("button");
      a.className = "reset", a.textContent = "Reset to Defaults", a.onclick = () => {
        Object.assign(s, k), E(), f();
        const n = e.querySelectorAll(".row"), i = [s.blurPx, s.dim, s.vignette];
        n.forEach((d, l) => {
          const u = d.querySelector("input[type=range]"), g = d.querySelector(".val");
          u.value = i[l], g.textContent = l === 0 ? `${Math.round(i[l])}px` : Math.round(i[l] * 100) / 100;
        });
      }, document.body.appendChild(e), D(e);
    }
    t.onclick = () => {
      const r = e.style.display !== "block";
      e.style.display = r ? "block" : "none", r && w(e);
    }, I(t), m = new ResizeObserver(() => {
      const r = c(o.panel);
      r && r.style.display === "block" && w(r);
    }), m.observe(document.documentElement), b = new MutationObserver(() => {
      const r = c(o.btn), a = c(o.panel);
      I(r), a && a.style.display === "block" && w(a);
    }), b.observe(document.body, { childList: !0, subtree: !0, attributes: !0 });
  }
  function q() {
    if (!$) {
      $ = !0, P(), C(), A(), f();
      try {
        p.addEventListener("mediaItemDidChange", y), p.addEventListener("nowPlayingItemDidChange", y);
      } catch {
      }
      y();
    }
  }
  return {
    setup() {
      return x = setInterval(() => {
        S() && (clearInterval(x), q());
      }, 250), {
        onClose() {
          try {
            clearInterval(x), m && m.disconnect(), b && b.disconnect();
          } catch {
          }
        }
      };
    },
    identifier: "com.danielc0603.immersiveartbg",
    meta: { identifier: "com.danielc0603.immersiveartbg", name: "Immersive Art BG", version: "1.4.1" }
  };
}
const R = J();
export {
  R as default
};
