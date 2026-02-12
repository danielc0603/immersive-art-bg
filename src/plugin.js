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


const NOW_PLAYING_FALLBACK = "http://127.0.0.1:10767/api/v1/playback/now-playing";

const Z_BG = 2147483646;
const Z_UI = 2147483647;

const LS_KEY = "ciderArtBgSettings_v2";
const DBG_KEY = "cabDebug";


const dbgEnabled = () => {
  try {
    return localStorage.getItem(DBG_KEY) === "1";
  } catch {
    return false;
  }
};
const dbg = (...args) => {
  if (!dbgEnabled()) return;
  console.log("[cab]", ...args);
};


function getHostWindow() {
  const candidates = [window];
  try {
    if (window.parent && window.parent !== window) candidates.push(window.parent);
  } catch {}
  try {
    if (window.top && window.top !== window) candidates.push(window.top);
  } catch {}

  for (const w of candidates) {
    try {
      if (w?.CiderApp) return w;
    } catch {}
  }
  return window;
}

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

function normalizeArtworkUrl(art) {
  if (!art) return null;
  if (typeof art === "string") return art;

  const url = art.url;
  if (!url) return null;

  if (url.includes("{w}") || url.includes("{h}")) {
    const w = Math.max(CFG.minArt, Number(art.width) || 0);
    const h = Math.max(CFG.minArt, Number(art.height) || 0);
    return url.replace("{w}", String(w)).replace("{h}", String(h));
  }
  return url;
}

const preload = (url) =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(url);
    img.onerror = rej;
    img.src = url;
  });

function makeKey(info) {
  const pp = info?.playParams || info?.attributes?.playParams || {};
  const name = info?.name || info?.attributes?.name;
  const artistName = info?.artistName || info?.attributes?.artistName;
  const albumName = info?.albumName || info?.attributes?.albumName;
  const dur = info?.durationInMillis || info?.attributes?.durationInMillis;

  return pp.catalogId
    ? `catalog:${pp.catalogId}`
    : pp.reportingId
    ? `reporting:${pp.reportingId}`
    : pp.id
    ? `id:${pp.id}`
    : `${name}|${artistName}|${albumName}|${dur}`;
}

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
  `;
  document.head.appendChild(style);

  const bgEl = document.createElement("div");
  bgEl.id = "cider-art-bg";
  document.body.appendChild(bgEl);

  const uiRoot =
    document.querySelector("#q-app") ||
    document.querySelector(".q-layout") ||
    document.querySelector("#app") ||
    document.querySelector("#root");

  if (uiRoot) {
    uiRoot.style.setProperty("position", "relative", "important");
    uiRoot.style.setProperty("z-index", String(Z_UI), "important");
  }

  return bgEl;
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

function mountControls(getSettings, setSettings) {
  document.getElementById("cab-ui")?.remove();

  const wrap = document.createElement("div");
  wrap.id = "cab-ui";
  wrap.innerHTML = `
    <button id="cab-btn" title="Background Settings">🎨</button>
    <div id="cab-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div>
          <div style="font-size:13px; font-weight:650;">Background Settings</div>
          <div style="font-size:11px; opacity:.65;">Live adjustments</div>
        </div>
        <button id="cab-close" style="width:28px;height:28px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">✕</button>
      </div>

      <div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px; display:flex; justify-content:space-between;"><span>Blur</span><span id="val-blur"></span></label>
          <input id="rng-blur" type="range" min="0" max="80" step="1" style="width:100%;">
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-size:12px; display:flex; justify-content:space-between;"><span>Dim</span><span id="val-dim"></span></label>
          <input id="rng-dim" type="range" min="0" max="0.85" step="0.01" style="width:100%;">
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-size:12px; display:flex; justify-content:space-between;"><span>Vignette</span><span id="val-vig"></span></label>
          <input id="rng-vig" type="range" min="0" max="0.9" step="0.01" style="width:100%;">
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-size:12px; display:flex; justify-content:space-between;"><span>Saturation</span><span id="val-sat"></span></label>
          <input id="rng-sat" type="range" min="0" max="1.6" step="0.01" style="width:100%;">
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-size:12px; display:flex; justify-content:space-between;"><span>Contrast</span><span id="val-ct"></span></label>
          <input id="rng-ct" type="range" min="0.6" max="1.6" step="0.01" style="width:100%;">
        </div>

        <div style="margin-bottom:12px;">
          <label style="font-size:12px; display:flex; justify-content:space-between;"><span>Brightness</span><span id="val-br"></span></label>
          <input id="rng-br" type="range" min="0.6" max="1.6" step="0.01" style="width:100%;">
        </div>

        <div style="display:flex; gap:10px;">
          <button id="cab-reset" style="flex:1;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:rgba(255,255,255,.92);padding:10px;cursor:pointer;">Reset</button>
          <button id="cab-hide"  style="flex:1;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:rgba(255,255,255,.92);padding:10px;cursor:pointer;">Hide UI</button>
        </div>
      </div>
    </div>
  `;

  findTopRightSlot().appendChild(wrap);

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

  if (onDocClick) {
    try {
      document.removeEventListener("click", onDocClick);
    } catch {}
  }

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


let bg = null;
let lastKey = null;
let inFlight = false;
let timer = null;
let obs = null;
let settings = null;
let onDocClick = null;
let started = false;
let rpcUnsub = null;


async function getNowPlayingInfo() {
  const host = getHostWindow();
  const rpc = host?.CiderApp?.RPC;

  const npa = rpc?.nowPlayingAttributes;

  if (npa != null) {
    // Debug the shape to confirm what's happening in your build
    dbg("rpc.nowPlayingAttributes typeof", typeof npa);

    // Case 1: function
    if (typeof npa === "function") {
      const data = await npa.call(rpc);
      return data?.attributes ? data.attributes : data;
    }

    // Case 2: object/proxy
    if (typeof npa === "object") {
      const data = npa;
      return data?.attributes ? data.attributes : data;
    }
  }

  // Fallback: local API (may 403)
  const resp = await fetch(NOW_PLAYING_FALLBACK);
  if (!resp.ok) throw new Error(`now-playing fallback failed: ${resp.status}`);
  const json = await resp.json();
  return json?.info || null;
}

function extractArtworkUrl(info) {
  const art = info?.artwork || info?.attributes?.artwork || null;
  return normalizeArtworkUrl(art);
}

async function applyArtworkUrl(url, why) {
  if (!bg || !url) return;

  await preload(url);

  bg.style.opacity = "0";
  setTimeout(() => {
    if (!bg) return;
    bg.style.backgroundImage = `url("${url}")`;
    bg.style.opacity = "1";
    disableImmersive();
    dbg("bg updated", why, url);
  }, 70);
}

async function tick(reason = "poll") {
  if (!started || inFlight || !bg) return;
  inFlight = true;

  try {
    disableImmersive();

    const info = await getNowPlayingInfo();
    if (!info) {
      dbg("no nowPlaying info", reason);
      return;
    }

    const key = makeKey(info);
    const url = extractArtworkUrl(info);

    dbg("tick", reason, { key, hasUrl: !!url });

    if (!key || key === lastKey) return;
    lastKey = key;

    if (!url) return;

    await applyArtworkUrl(url, reason);
  } catch (e) {
    dbg("tick error", reason, e?.message || e);
  } finally {
    inFlight = false;
  }
}


function trySubscribeRPC() {
  const host = getHostWindow();
  const rpc = host?.CiderApp?.RPC;
  if (!rpc) return null;


  try {
    if (typeof rpc.on === "function") {
      const off1 = rpc.on("nowPlayingItemDidChange", () => tick("rpc:event"));
      const off2 = rpc.on("playbackStateDidChange", () => tick("rpc:event"));
      return () => {
        try {
          if (typeof off1 === "function") off1();
          if (typeof off2 === "function") off2();
        } catch {}
      };
    }
  } catch {}

  try {
    if (typeof rpc.addEventListener === "function") {
      const cb = () => tick("rpc:event");
      rpc.addEventListener("nowPlayingItemDidChange", cb);
      rpc.addEventListener("playbackStateDidChange", cb);
      return () => {
        try {
          rpc.removeEventListener("nowPlayingItemDidChange", cb);
          rpc.removeEventListener("playbackStateDidChange", cb);
        } catch {}
      };
    }
  } catch {}

  try {
    if (typeof rpc.subscribe === "function") {
      const off = rpc.subscribe(() => tick("rpc:subscribe"));
      return () => {
        try {
          if (typeof off === "function") off();
        } catch {}
      };
    }
  } catch {}

  return null;
}

function start() {
  if (started) return;
  started = true;

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

  rpcUnsub = trySubscribeRPC();
  dbg("started", { rpcSubscribed: !!rpcUnsub, pollMs: CFG.pollMs });

  timer = setInterval(() => tick("poll"), CFG.pollMs);
  tick("start");
}

function stop() {
  started = false;

  try {
    if (timer) clearInterval(timer);
  } catch {}
  timer = null;

  try {
    if (obs) obs.disconnect();
  } catch {}
  obs = null;

  try {
    if (rpcUnsub) rpcUnsub();
  } catch {}
  rpcUnsub = null;

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

  bg = null;
  lastKey = null;
  dbg("stopped");
}


function setup() {
  // Debug signal: module was imported and setup() ran
  try {
    const enabled = localStorage.getItem("cabDebug") === "1";
    if (enabled) console.log("[cab] setup() called, autostarting");
  } catch {}

  // Autostart (some hosts never call start() explicitly)
  setTimeout(() => {
    try { start(); } catch (e) {
      try { console.log("[cab] autostart error", e); } catch {}
    }
  }, 0);

  return { start, stop };
}

export default {
  identifier: "com.danielc0603.immersiveartbg",
  name: "Immersive Art BG",
  version: "1.4.7",
  setup
};