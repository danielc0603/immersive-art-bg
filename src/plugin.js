const DEFAULTS = {
  pollMs: 900,
  blurPx: 28,
  dim: 0.35,
  vignette: 0.35,
  minArt: 1400,
  saturate: 1.1,
  contrast: 1,
  brightness: 1
};

const CFG = { ...DEFAULTS };

const NOW_PLAYING = "http://localhost:10767/api/v1/playback/now-playing";

const Z_BG = 2147483646;
const Z_UI = 2147483647;

const LS_KEY = "ciderArtBgSettings_v2";

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(s) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}

function applySettings(s) {
  const r = document.documentElement.style;
  r.setProperty("--cab-blur", `${s.blurPx}px`);
  r.setProperty("--cab-dim", String(s.dim));
  r.setProperty("--cab-vig", String(s.vignette));
  r.setProperty("--cab-sat", String(s.saturate));
  r.setProperty("--cab-ct", String(s.contrast));
  r.setProperty("--cab-br", String(s.brightness));
}

const resolveArtwork = (art) => {
  if (!art?.url) return null;
  const w = Math.max(CFG.minArt, Number(art.width) || 0);
  const h = Math.max(CFG.minArt, Number(art.height) || 0);
  return art.url.replace("{w}", String(w)).replace("{h}", String(h));
};

const preload = (url) =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(url);
    img.onerror = rej;
    img.src = url;
  });

const makeKey = (info) => {
  const pp = info?.playParams || {};
  return pp.catalogId
    ? `catalog:${pp.catalogId}`
    : pp.reportingId
    ? `reporting:${pp.reportingId}`
    : pp.id
    ? `id:${pp.id}`
    : `${info?.name}|${info?.artistName}|${info?.albumName}|${info?.durationInMillis}`;
};

function disableImmersive() {
  const selectors = [
    "#adaptive-bg-container",
    "#adaptive-bg",
    ".top-blurmap",
    ".blurmap-container",
    ".blurmap-container canvas",
    ".top-blurmap canvas",
    "canvas"
  ];

  const nodes = [];
  for (const sel of selectors) nodes.push(...document.querySelectorAll(sel));

  const unique = Array.from(new Set(nodes)).filter((el) => {
    if (el.tagName.toLowerCase() !== "canvas") return true;
    const r = el.getBoundingClientRect();
    return r.width >= innerWidth * 0.85 && r.height >= innerHeight * 0.85;
  });

  for (const el of unique) {
    el.style.setProperty("opacity", "0", "important");
    el.style.setProperty("visibility", "hidden", "important");
    el.style.setProperty("pointer-events", "none", "important");
    el.style.setProperty("filter", "none", "important");
    el.style.setProperty("background", "transparent", "important");

    if (
      el.id === "adaptive-bg-container" ||
      el.id === "adaptive-bg" ||
      el.classList?.contains("blurmap-container") ||
      el.classList?.contains("top-blurmap") ||
      el.tagName.toLowerCase() === "canvas"
    ) {
      el.style.setProperty("display", "none", "important");
    }

    el.dataset._ciderArtBgDisabled = "1";
  }
}

function ensureBgLayer(settings) {
  document.getElementById("cider-art-bg")?.remove();
  document.getElementById("cider-art-bg-style")?.remove();

  const style = document.createElement("style");
  style.id = "cider-art-bg-style";
  style.textContent = `
    :root{
      --cab-blur: ${settings.blurPx}px;
      --cab-dim: ${settings.dim};
      --cab-vig: ${settings.vignette};
      --cab-sat: ${settings.saturate};
      --cab-ct: ${settings.contrast};
      --cab-br: ${settings.brightness};
    }

    #cider-art-bg {
      position: fixed;
      inset: 0;
      z-index: ${Z_BG};
      pointer-events: none;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transform: scale(1.05);
      filter: blur(var(--cab-blur)) saturate(var(--cab-sat)) contrast(var(--cab-ct)) brightness(var(--cab-br));
      opacity: 0;
      transition: opacity 350ms ease;
    }

    #cider-art-bg::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at center,
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,0) 70%,
        rgba(0,0,0,var(--cab-vig)) 100%
      );
    }

    #cider-art-bg::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,var(--cab-dim));
    }

    #cab-ui { position: relative; z-index: ${Z_UI}; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }

    #cab-btn {
      width: 28px; height: 28px;
      border-radius: 9px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.06);
      color: white;
      cursor: pointer;
      display:flex; align-items:center; justify-content:center;
      user-select: none;
      font-size: 16px;
      line-height: 1;
      padding: 0;
      backdrop-filter: blur(10px) saturate(1.25);
      -webkit-backdrop-filter: blur(10px) saturate(1.25);
      box-shadow: 0 10px 30px rgba(0,0,0,0.28);
      transition: transform 120ms ease, filter 120ms ease, background 120ms ease;
    }
    #cab-btn:hover { filter: brightness(1.15); background: rgba(255,255,255,0.085); }
    #cab-btn:active { transform: scale(0.96); }

    #cab-panel {
      position: absolute;
      right: 0;
      top: 34px;
      width: 320px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.14);
      background: linear-gradient(180deg, rgba(30,30,35,0.62), rgba(18,18,22,0.55));
      color: rgba(255,255,255,0.92);
      padding: 14px 14px 12px;
      backdrop-filter: blur(18px) saturate(1.35);
      -webkit-backdrop-filter: blur(18px) saturate(1.35);
      box-shadow: 0 18px 70px rgba(0,0,0,0.55);
      display: none;
      overflow: hidden;
    }
    #cab-panel.open { display:block; }

    #cab-panel::before{
      content:"";
      position:absolute;
      inset:0;
      background: radial-gradient(circle at 20% 0%, rgba(255,255,255,0.10), transparent 45%),
                  radial-gradient(circle at 90% 15%, rgba(255,255,255,0.07), transparent 40%);
      pointer-events:none;
    }

    .cab-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }
    .cab-title{
      display:flex;
      flex-direction:column;
      gap: 2px;
    }
    .cab-title .t1{
      font-size: 13px;
      font-weight: 650;
      letter-spacing: 0.2px;
      color: rgba(255,255,255,0.92);
    }
    .cab-title .t2{
      font-size: 11px;
      opacity: 0.65;
    }

    #cab-close{
      width: 28px;
      height: 28px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      user-select:none;
      transition: filter 120ms ease, transform 120ms ease, background 120ms ease;
      position: relative;
      z-index: 1;
    }
    #cab-close:hover{ filter: brightness(1.15); background: rgba(255,255,255,0.085); }
    #cab-close:active{ transform: scale(0.96); }

    .cab-grid{
      display:grid;
      grid-template-columns: 1fr;
      gap: 10px;
      position: relative;
      z-index: 1;
    }

    .cab-row{
      padding: 10px 10px 9px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.05);
    }

    .cab-row label{
      font-size: 12px;
      opacity: 0.9;
      display:flex;
      justify-content:space-between;
      align-items:baseline;
      margin-bottom: 8px;
    }
    .cab-row label span:last-child{
      font-size: 11px;
      opacity: 0.7;
    }

    .cab-row input[type="range"]{
      width: 100%;
      height: 18px;
      background: transparent;
      accent-color: rgba(255,255,255,0.92);
    }

    .cab-actions{
      display:flex;
      gap: 10px;
      margin-top: 12px;
      position: relative;
      z-index: 1;
    }
    .cab-actions button{
      flex: 1;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.92);
      padding: 10px 10px;
      cursor: pointer;
      transition: filter 120ms ease, transform 120ms ease, background 120ms ease;
    }
    .cab-actions button:hover{ filter: brightness(1.12); background: rgba(255,255,255,0.09); }
    .cab-actions button:active{ transform: scale(0.98); }
  `;
  document.head.appendChild(style);

  const bg = document.createElement("div");
  bg.id = "cider-art-bg";
  document.body.appendChild(bg);

  const uiRoot =
    document.querySelector("#q-app") ||
    document.querySelector(".q-layout") ||
    document.querySelector("#app") ||
    document.querySelector("#root");

  if (uiRoot) {
    uiRoot.style.setProperty("position", "relative", "important");
    uiRoot.style.setProperty("z-index", String(Z_UI), "important");
  }

  return bg;
}

function findTopRightSlot() {
  const candidates = [
    ".q-header .q-toolbar",
    "header .q-toolbar",
    ".topbar",
    "header",
    ".titlebar",
    "#q-app header"
  ];

  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (!el) continue;

    const buttons = el.querySelectorAll("button, .q-btn, [role='button']");
    if (buttons && buttons.length) {
      const parent = buttons[buttons.length - 1].parentElement || el;
      return parent;
    }

    return el;
  }

  const fallback = document.createElement("div");
  fallback.style.position = "fixed";
  fallback.style.top = "10px";
  fallback.style.right = "16px";
  fallback.style.zIndex = String(Z_UI);
  document.body.appendChild(fallback);
  return fallback;
}

// ---- runtime state ----
let bg = null;
let lastKey = null;
let inFlight = false;
let timer = null;
let obs = null;
let settings = null;


let onDocClick = null;

async function tick() {
  if (inFlight) return;
  inFlight = true;

  try {
    disableImmersive();

    const data = await fetch(NOW_PLAYING).then((r) => r.json());
    const info = data?.info;
    if (!info) return;

    const key = makeKey(info);
    if (!key || key === lastKey) return;
    lastKey = key;

    const url = resolveArtwork(info.artwork);
    if (!url) return;

    await preload(url);

    bg.style.opacity = "0";
    setTimeout(() => {
      bg.style.backgroundImage = `url("${url}")`;
      bg.style.opacity = "1";
      disableImmersive();
    }, 70);
  } catch (e) {
    
  } finally {
    inFlight = false;
  }
}

function mountControls(getSettings, setSettings) {
  document.getElementById("cab-ui")?.remove();

  const wrap = document.createElement("div");
  wrap.id = "cab-ui";

  wrap.innerHTML = `
    <button id="cab-btn" title="Background Settings">🎨</button>
    <div id="cab-panel">
      <div class="cab-head">
        <div class="cab-title">
          <div class="t1">Background Settings</div>
          <div class="t2">Live adjustments</div>
        </div>
        <div id="cab-close">✕</div>
      </div>

      <div class="cab-grid">
        <div class="cab-row">
          <label><span>Blur</span><span id="val-blur"></span></label>
          <input id="rng-blur" type="range" min="0" max="80" step="1">
        </div>

        <div class="cab-row">
          <label><span>Dim</span><span id="val-dim"></span></label>
          <input id="rng-dim" type="range" min="0" max="0.85" step="0.01">
        </div>

        <div class="cab-row">
          <label><span>Vignette</span><span id="val-vig"></span></label>
          <input id="rng-vig" type="range" min="0" max="0.9" step="0.01">
        </div>

        <div class="cab-row">
          <label><span>Saturation</span><span id="val-sat"></span></label>
          <input id="rng-sat" type="range" min="0" max="1.6" step="0.01">
        </div>

        <div class="cab-row">
          <label><span>Contrast</span><span id="val-ct"></span></label>
          <input id="rng-ct" type="range" min="0.6" max="1.6" step="0.01">
        </div>

        <div class="cab-row">
          <label><span>Brightness</span><span id="val-br"></span></label>
          <input id="rng-br" type="range" min="0.6" max="1.6" step="0.01">
        </div>
      </div>

      <div class="cab-actions">
        <button id="cab-reset">Reset</button>
        <button id="cab-hide">Hide UI</button>
      </div>
    </div>
  `;

  const slot = findTopRightSlot();
  slot.appendChild(wrap);

  const panel = wrap.querySelector("#cab-panel");
  const btn = wrap.querySelector("#cab-btn");
  const close = wrap.querySelector("#cab-close");

  const q = (sel) => wrap.querySelector(sel);

  function syncUI(s) {
    q("#rng-blur").value = s.blurPx;
    q("#rng-dim").value = s.dim;
    q("#rng-vig").value = s.vignette;
    q("#rng-sat").value = s.saturate;
    q("#rng-ct").value = s.contrast;
    q("#rng-br").value = s.brightness;

    q("#val-blur").textContent = `${s.blurPx}px`;
    q("#val-dim").textContent = `${Math.round(s.dim * 100)}%`;
    q("#val-vig").textContent = `${Math.round(s.vignette * 100)}%`;
    q("#val-sat").textContent = s.saturate.toFixed(2);
    q("#val-ct").textContent = s.contrast.toFixed(2);
    q("#val-br").textContent = s.brightness.toFixed(2);
  }

  function update(partial) {
    const next = { ...getSettings(), ...partial };
    setSettings(next);
    syncUI(next);
  }

  btn.addEventListener("click", () => panel.classList.toggle("open"));
  close.addEventListener("click", () => panel.classList.remove("open"));


  try {
    if (onDocClick) document.removeEventListener("click", onDocClick);
  } catch {}

  onDocClick = (e) => {
    if (!panel.classList.contains("open")) return;
    if (wrap.contains(e.target)) return;
    panel.classList.remove("open");
  };

  document.addEventListener("click", onDocClick);

  q("#rng-blur").addEventListener("input", (e) => update({ blurPx: Number(e.target.value) }));
  q("#rng-dim").addEventListener("input", (e) => update({ dim: Number(e.target.value) }));
  q("#rng-vig").addEventListener("input", (e) => update({ vignette: Number(e.target.value) }));
  q("#rng-sat").addEventListener("input", (e) => update({ saturate: Number(e.target.value) }));
  q("#rng-ct").addEventListener("input", (e) => update({ contrast: Number(e.target.value) }));
  q("#rng-br").addEventListener("input", (e) => update({ brightness: Number(e.target.value) }));

  q("#cab-reset").addEventListener("click", () => update({ ...DEFAULTS }));
  q("#cab-hide").addEventListener("click", () => wrap.remove());

  syncUI(getSettings());
}

export function start() {
  settings = loadSettings();
  bg = ensureBgLayer(settings);
  applySettings(settings);

  mountControls(
    () => settings,
    (next) => {
      settings = next;
      applySettings(settings);
      saveSettings(settings);
    }
  );

  disableImmersive();

  obs = new MutationObserver(() => disableImmersive());
  obs.observe(document.body, { childList: true, subtree: true });

  timer = setInterval(tick, CFG.pollMs);
  tick();

  window.__ciderArtBgStop = () => {

    try {
      if (timer) clearInterval(timer);
    } catch {}
    try {
      if (obs) obs.disconnect();
    } catch {}
    timer = null;
    obs = null;


    try {
      if (onDocClick) document.removeEventListener("click", onDocClick);
    } catch {}
    onDocClick = null;


    try {
      document.getElementById("cider-art-bg")?.remove();
    } catch {}
    try {
      document.getElementById("cider-art-bg-style")?.remove();
    } catch {}
    try {
      document.getElementById("cab-ui")?.remove();
    } catch {}
  };
}

function stop() {

  try {
    window.__ciderArtBgStop?.();
  } catch {}


  try {
    delete window.__ciderArtBgStop;
  } catch {}
}


const plugin = {
  name: "Immersive Art BG",
  version: "1.4.3",
  start,
  stop
};

export default plugin;
