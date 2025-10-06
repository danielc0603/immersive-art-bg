// Immersive Art BG — v1.4.2 (static panel, liquid glass)

async function P() {
  // Wait up to 5s for MusicKit to initialize
  let mk = (window.MusicKit && window.MusicKit.getInstance && window.MusicKit.getInstance()) || null;
  const start = Date.now();
  while (!mk && Date.now() - start < 5000) {
    await new Promise(r => setTimeout(r, 100));
    mk = (window.MusicKit && window.MusicKit.getInstance && window.MusicKit.getInstance()) || null;
  }
  if (!mk) { console.warn("[ImmersiveArtBG] MusicKit not ready after timeout"); return; }

  const DEFAULTS = { blurPx: 32, dim: 0.35, vignette: 0.35 };
  const cfg = Object.assign({}, DEFAULTS, safeParse(localStorage.getItem("iab-settings")) || {});
  const IDS = { style: "iab-style", layer: "iab-bg", panel: "iab-panel", btn: "iab-btn" };
  const $ = (id) => document.getElementById(id);
  const save = () => localStorage.setItem("iab-settings", JSON.stringify(cfg));

  ensureStyle();
  ensureLayer();
  ensurePanel();
  applyAll();
  bindEvents();
  update();

  // ---------- event wiring ----------
  function bindEvents() {
    const u = () => { try { update(); } catch (e) { console.warn("[ImmersiveArtBG] update skipped:", e); } };
    try { mk.addEventListener("mediaItemDidChange", u); } catch {}
    try { mk.addEventListener("nowPlayingItemDidChange", u); } catch {}
    try { mk.player?.addEventListener("nowplayingitemchanged", u); } catch {}
  }

  // ---------- core updates ----------
  function update() {
    const item = nowItem();
    if (!item) return;
    const url = artFrom(item, 2000);
    if (!url) return;
    setBG(url);
    applyAll();
  }

  function nowItem() {
    return mk.nowPlayingItem || mk.player?.nowPlayingItem || null;
  }

  function artFrom(item, size) {
    const u = item && item.attributes && item.attributes.artwork && item.attributes.artwork.url;
    return typeof u === "string" ? u.replace("{w}x{h}", String(size) + "x" + String(size)) : "";
  }

  function setBG(url) {
    ensureLayer();
    const d = $(IDS.layer);
    if (d) d.style.backgroundImage = 'url("' + url + '")';
  }

  function applyAll() {
    const blur = clamp(Math.round(Number(cfg.blurPx) || 0), 0, 100);
    const dim  = clamp(Number(cfg.dim) || 0, 0, 1);
    const vig  = clamp(Number(cfg.vignette) || 0, 0, 1);

    document.documentElement.style.setProperty("--iab-blur", blur + "px");
    document.documentElement.style.setProperty("--iab-dim", String(dim));
    document.documentElement.style.setProperty("--iab-vig", String(vig));

    save(); // persist settings
  }

  // ---------- DOM ----------
  function ensureLayer() {
    if ($(IDS.layer)) return;
    const d = document.createElement("div");
    d.id = IDS.layer;
    document.body.prepend(d);
  }

  function ensureStyle() {
    if ($(IDS.style)) return;

    const NOISE = encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>"
      + "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>"
      + "<feColorMatrix type='saturate' values='0'/>"
      + "<feComponentTransfer><feFuncA type='table' tableValues='0 0 0 .02 .04 .06 .08 .10'/></feComponentTransfer>"
      + "</filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
    );

    const css =
`:root{
  --iab-blur:${clamp(cfg.blurPx,0,100)}px;
  --iab-dim:${clamp(cfg.dim,0,1)};
  --iab-vig:${clamp(cfg.vignette,0,1)};
  --iab-safe-top:max(12px, env(safe-area-inset-top, 0px));
  --iab-safe-right:max(12px, env(safe-area-inset-right, 0px));
  --iab-panel-w:min(360px, calc(100vw - 24px));
}
/* background layer (keeps the panel crisp even at 100px) */
#${IDS.layer}{
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.06);
  pointer-events: none;
  isolation: isolate; /* prevents blur bleed into overlays */
}

/* apply the heavy blur only to the layer’s backdrop */
#${IDS.layer}::before{
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(var(--iab-blur)) !important;
  -webkit-backdrop-filter: blur(var(--iab-blur)) !important;
}

/* dim + vignette overlay */
#${IDS.layer}::after{
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 50%,
      rgba(0,0,0,var(--iab-vig)) 0%,
      rgba(0,0,0,0) 55%,
      rgba(0,0,0,var(--iab-vig)) 100%),
    rgba(0,0,0,var(--iab-dim));
}
/* keep app above */
#app{ position:relative; z-index:1; }

/* toggle button */
#${IDS.btn}{
  position:fixed; top:calc(var(--iab-safe-top) - 3px); right:calc(var(--iab-safe-right) + 75px);
  width:30px; height:30px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  color:#fff; cursor:pointer; border:1px solid rgba(255,255,255,.12);
  background:rgba(24,24,24,.40);
  -webkit-app-region:no-drag; pointer-events:auto;
  backdrop-filter:saturate(160%) blur(10px);
  transition:transform .12s ease, background .12s ease, border-color .12s ease;
  z-index:2147483647;
}
#${IDS.btn}:hover{ transform:translateY(-1px); background:rgba(24,24,24,.55); border-color:rgba(255,255,255,.2); }

/* liquid-glass panel */
#${IDS.panel}{
  position:fixed; top:calc(var(--iab-safe-top) + 36px); right:var(--iab-safe-right);
  width:var(--iab-panel-w); max-width:360px;
  color:#e9e9ea; z-index:2147483646; -webkit-app-region:no-drag; pointer-events:auto;
  background: rgba(20,20,22,.34);
  backdrop-filter: blur(26px) saturate(185%);
  -webkit-backdrop-filter: blur(26px) saturate(185%);
  border-radius:14px; padding:14px 14px 12px; border:1px solid rgba(255,255,255,.12);
  box-shadow: 0 8px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.10);
  overflow:hidden;
  will-change: transform, opacity, backdrop-filter;
}
#${IDS.panel}::after{
  content:""; position:absolute; inset:0; pointer-events:none; opacity:.45;
  background-image:url("data:image/svg+xml,${NOISE}");
  mix-blend-mode:overlay;
}
@supports not (backdrop-filter: blur(10px)){
  #${IDS.panel}{ background: rgba(20,20,22,.92); }
}
#${IDS.panel} h3{ margin:2px 0 12px; font:600 15px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; }
#${IDS.panel} .row{
  display:grid; grid-template-columns:auto 1fr auto; align-items:center;
  gap:12px; margin:12px 0 10px;
}
#${IDS.panel} .row label{white-space:nowrap;}
#${IDS.panel} .row input[type=range]{ width:100%; height:6px; accent-color:#ff4d4f; }
#${IDS.panel} .row .val{ min-width:52px; text-align:right; opacity:.92; }
#${IDS.panel} .reset{
  width:100%; margin-top:12px; padding:11px 12px;
  border:none; border-radius:10px;
  font-weight:700; letter-spacing:.2px; color:#fff; cursor:pointer;
  background:linear-gradient(180deg, #d84a43, #b73934);
  box-shadow: 0 6px 18px rgba(184,56,51,.35), inset 0 1px 0 rgba(255,255,255,.22);
}
#${IDS.panel} .reset:hover{ filter:brightness(1.05); }

/* open/close animation */
#${IDS.panel}[data-open="0"]{ opacity:0; transform:translateY(-6px); pointer-events:none; }
#${IDS.panel}[data-open="1"]{ opacity:1; transform:none; transition:opacity .16s ease, transform .16s ease; }
`;
    const style = document.createElement("style");
    style.id = IDS.style;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    let btn = $(IDS.btn);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = IDS.btn;
      btn.title = "Immersive Art Settings";
      btn.textContent = "🎨";
      ["mousedown","click"].forEach(ev => btn.addEventListener(ev, e => e.stopPropagation()));
      document.body.appendChild(btn);
    }

    let panel = $(IDS.panel);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = IDS.panel;
      panel.setAttribute("data-open", "0");
      ["mousedown","click"].forEach(ev => panel.addEventListener(ev, e => e.stopPropagation()));

      const h = document.createElement("h3");
      h.textContent = "Immersive Art BG";
      panel.appendChild(h);

      panel.appendChild(sliderRow("Blur",     0, 100, 1,    "blurPx"));
      panel.appendChild(sliderRow("Dim",      0,   1, 0.01, "dim"));
      panel.appendChild(sliderRow("Vignette", 0,   1, 0.01, "vignette"));

      const reset = document.createElement("button");
      reset.className = "reset";
      reset.textContent = "Reset to Defaults";
      reset.onclick = () => {
        cfg.blurPx = DEFAULTS.blurPx;
        cfg.dim = DEFAULTS.dim;
        cfg.vignette = DEFAULTS.vignette;
        refreshRows(panel);
        applyAll();
      };
      panel.appendChild(reset);

      document.body.appendChild(panel);
    }

    const setOpen = (open) => $(IDS.panel).setAttribute("data-open", open ? "1" : "0");
    btn.onclick = () => setOpen($(IDS.panel).getAttribute("data-open") !== "1");
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $(IDS.panel).getAttribute("data-open") === "1") setOpen(false);
    });
  }

  function sliderRow(label, min, max, step, key) {
    const row = document.createElement("div");
    row.className = "row";

    const lab = document.createElement("label");
    lab.textContent = label;

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(cfg[key]);

    const val = document.createElement("div");
    val.className = "val";

    const fmt = (x) => key === "blurPx" ? (Math.round(x) + "px") : String(Math.round(x * 100) / 100);
    val.textContent = fmt(cfg[key]);

    input.oninput = (e) => {
      const v = parseFloat(e.target.value);
      cfg[key] = key === "blurPx" ? clamp(Math.round(v), 0, 100) : clamp(v, 0, 1);
      val.textContent = fmt(cfg[key]);
      applyAll();
    };

    row.append(lab, input, val);
    return row;
  }

  function refreshRows(panel) {
    const vals = [cfg.blurPx, cfg.dim, cfg.vignette];
    panel.querySelectorAll(".row").forEach((r, i) => {
      const input = r.querySelector("input[type=range]");
      const readout = r.querySelector(".val");
      input.value = String(vals[i]);
      readout.textContent = i === 0 ? (Math.round(vals[i]) + "px") : String(Math.round(vals[i] * 100) / 100);
    });
  }

  // ---------- utils ----------
  function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
}

export { P as default };