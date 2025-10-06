// Immersive Art BG — draggable panel, smart docking, setup()-based export

function createPlugin() {
  let started = false, mk, gate, ro, mo;

  const defaults = { blurPx: 32, dim: 0.35, vignette: 0.35 };
  const saved = JSON.parse(localStorage.getItem('iab-settings') || '{}');
  const cfg = { ...defaults, ...saved };
  const save = () => localStorage.setItem('iab-settings', JSON.stringify(cfg));

  const ID = { style: 'iab-style', layer: 'iab-bg', panel: 'iab-panel', btn: 'iab-btn' };
  const $  = id => document.getElementById(id);

  function ready() {
    try {
      if (!window.MusicKit || !MusicKit.getInstance) return false;
      mk = MusicKit.getInstance();
      return !!mk && document.readyState !== 'loading' && document.body;
    } catch { return false; }
  }

  function ensureStyle(){
    if ($(ID.style)) return;
    const css = `
:root{ --iab-blur:${cfg.blurPx}px; --iab-dim:${cfg.dim}; --iab-vignette:${cfg.vignette}; }
#${ID.layer}{ position:fixed; inset:0; background-size:cover; background-position:center;
  transform:scale(1.06); pointer-events:none; z-index:0; filter:blur(var(--iab-blur)) !important; }
#${ID.layer}::after{ content:""; position:absolute; inset:0;
  background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,var(--iab-vignette)) 100%), rgba(0,0,0,var(--iab-dim)); }

#${ID.btn}{ position:fixed; top:10px; right:86px; width:28px; height:28px; border-radius:50%;
  display:flex; align-items:center; justify-content:center; background:rgba(30,30,30,.85); color:#fff;
  border:1px solid rgba(255,255,255,.12); cursor:pointer; z-index:2147483647; backdrop-filter:saturate(120%) blur(6px);
  -webkit-app-region:no-drag; pointer-events:auto; }
#${ID.btn}.dock{ position:static; right:auto; top:auto; margin-left:8px; width:26px; height:26px; border-radius:6px; background:rgba(40,40,40,.85); }

#${ID.panel}{ position:fixed; width:clamp(260px,24vw,360px); max-height:calc(100vh - 70px); overflow:auto;
  background:rgba(20,20,20,.92); color:#eee; border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:12px;
  font:12px/1.3 -apple-system,system-ui; backdrop-filter:saturate(120%) blur(8px); z-index:2147483646;
  -webkit-app-region:no-drag; pointer-events:auto; display:none; box-shadow:0 10px 30px rgba(0,0,0,.35); cursor:grab; }
#${ID.panel}:active{ cursor:grabbing; }
#${ID.panel} h3{ margin:0 0 8px; font:600 13px -apple-system,system-ui; }
#${ID.panel} .row{ display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; margin:8px 0; }
#${ID.panel} .row input[type=range]{ width:100%; }
#${ID.panel} .row .val{ min-width:48px; text-align:right; opacity:.9; }
#${ID.panel} .reset{ margin-top:10px; width:100%; padding:6px 0; border:none; border-radius:6px; background:#c62828; color:#fff; font-weight:600; cursor:pointer; }
`;
    const s=document.createElement('style'); s.id=ID.style; s.textContent=css; document.head.appendChild(s);
  }

  function ensureLayer(){ if(!$(ID.layer)){ const el=document.createElement('div'); el.id=ID.layer; document.body.prepend(el); } }
  const artFrom = (item, size) => item?.attributes?.artwork?.url?.replace?.('{w}x{h}',`${size}x${size}`) || '';
  function setBG(url){ if(!url) return; ensureLayer(); $(ID.layer).style.backgroundImage = `url("${url}")`; }
  function applyVars(){
    document.documentElement.style.setProperty('--iab-blur', `${cfg.blurPx}px`);
    document.documentElement.style.setProperty('--iab-dim', cfg.dim);
    document.documentElement.style.setProperty('--iab-vignette', cfg.vignette);
    const el=$(ID.layer); if(el) el.style.filter = `blur(${cfg.blurPx}px)`;
  }
  function applyArt(){ setBG(artFrom(MusicKit.getInstance().nowPlayingItem, 2000)); applyVars(); }

  function mkRow(lbl,min,max,step,key){
    const row=document.createElement('div'); row.className='row';
    const lab=document.createElement('label'); lab.textContent=lbl;
    const inp=document.createElement('input'); inp.type='range'; inp.min=min; inp.max=max; inp.step=step; inp.value=cfg[key];
    const val=document.createElement('div'); val.className='val';
    const fmt=v=> key==='blurPx'?`${Math.round(v)}px`:(Math.round(v*100)/100);
    val.textContent=fmt(cfg[key]);
    inp.oninput=e=>{ cfg[key]=parseFloat(e.target.value); save(); val.textContent=fmt(cfg[key]); applyVars(); };
    row.append(lab,inp,val); return row;
  }

  const TOOLBAR_QS = [
    'header [role="toolbar"]',
    'header .toolbar, header .topbar, header .window-toolbar',
    '.titlebar .right, #titlebar .right',
    'header [data-region="window-controls"] ~ div',
    '.quick-actions, .header-actions',
  ];
  const findToolbar = () => TOOLBAR_QS.map(q=>document.querySelector(q)).find(Boolean) || null;

  function dockButton(btn){
    const host = findToolbar();
    if (host) {
      if (btn.parentElement !== host) host.appendChild(btn);
      btn.classList.add('dock');
      return true;
    }
    if (btn.parentElement !== document.body) document.body.appendChild(btn);
    btn.classList.remove('dock');
    return false;
  }

  function positionPanel(panel){
    const pad = 12, vw = window.innerWidth, vh = window.innerHeight;
    let pos = JSON.parse(localStorage.getItem('iab-panel-pos') || 'null');
    if (!pos) {
      const btn = $(ID.btn);
      if (btn) {
        const r = btn.getBoundingClientRect();
        pos = { left: Math.min(vw - 300, r.right - 280), top: r.bottom + 10 };
      } else {
        pos = { left: vw - 360, top: 50 };
      }
    }
    pos.left = Math.min(vw - panel.offsetWidth - pad, Math.max(pad, pos.left));
    pos.top  = Math.min(vh - panel.offsetHeight - pad, Math.max(pad, pos.top));
    panel.style.left = `${pos.left}px`;
    panel.style.top  = `${pos.top}px`;
    localStorage.setItem('iab-panel-pos', JSON.stringify(pos));
  }

  function makeDraggable(panel){
    let dragging = false, offsetX = 0, offsetY = 0;
    panel.addEventListener('mousedown', e=>{
      if (e.target.closest('input,button')) return;
      dragging = true;
      offsetX = e.clientX - panel.offsetLeft;
      offsetY = e.clientY - panel.offsetTop;
      panel.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e=>{
      if (!dragging) return;
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;
      const vw = window.innerWidth, vh = window.innerHeight;
      left = Math.min(vw - panel.offsetWidth, Math.max(0, left));
      top = Math.min(vh - panel.offsetHeight, Math.max(0, top));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    });
    document.addEventListener('mouseup', ()=>{
      if (dragging) {
        dragging = false;
        panel.style.cursor = 'grab';
        localStorage.setItem('iab-panel-pos', JSON.stringify({ left: panel.offsetLeft, top: panel.offsetTop }));
      }
    });
  }

  function ensureControls(){
    let btn = $(ID.btn);
    if (!btn){
      btn = document.createElement('button');
      btn.id = ID.btn;
      btn.title = 'Immersive Art Settings';
      btn.textContent = '🎨';
      document.body.appendChild(btn);
    }

    let panel = $(ID.panel);
    if (!panel){
      panel = document.createElement('div'); panel.id = ID.panel;
      const h=document.createElement('h3'); h.textContent='Immersive Art BG'; panel.appendChild(h);
      panel.appendChild(mkRow('Blur',0,100,1,'blurPx'));
      panel.appendChild(mkRow('Dim',0,1,0.01,'dim'));
      panel.appendChild(mkRow('Vignette',0,1,0.01,'vignette'));
      const resetBtn=document.createElement('button'); resetBtn.className='reset'; resetBtn.textContent='Reset to Defaults';
      resetBtn.onclick=()=>{ Object.assign(cfg, defaults); save(); applyVars();
        const rows=panel.querySelectorAll('.row'); const vals=[cfg.blurPx,cfg.dim,cfg.vignette];
        rows.forEach((r,i)=>{ const inp=r.querySelector('input[type=range]'); const val=r.querySelector('.val');
          inp.value=vals[i]; val.textContent=(i===0?`${Math.round(vals[i])}px`:(Math.round(vals[i]*100)/100)); });
      };
      document.body.appendChild(panel);
      makeDraggable(panel);
    }

    btn.onclick=()=>{
      const show = panel.style.display!=='block';
      panel.style.display = show ? 'block' : 'none';
      if (show) positionPanel(panel);
    };

    dockButton(btn);

    ro = new ResizeObserver(()=>{ const panel=$(ID.panel); if (panel && panel.style.display==='block') positionPanel(panel); });
    ro.observe(document.documentElement);

    mo = new MutationObserver(()=>{ const btn=$(ID.btn), panel=$(ID.panel);
      dockButton(btn); if (panel && panel.style.display==='block') positionPanel(panel); });
    mo.observe(document.body, { childList:true, subtree:true, attributes:true });
  }

  function start(){
    if (started) return; started = true;
    ensureStyle(); ensureLayer(); ensureControls(); applyVars();
    try {
      mk.addEventListener('mediaItemDidChange', applyArt);
      mk.addEventListener('nowPlayingItemDidChange', applyArt);
    } catch {}
    applyArt();
  }

  return {
    setup(/* ctx */){
      gate = setInterval(() => { if (ready()) { clearInterval(gate); start(); } }, 250);
      return {
        onClose(){ try{ clearInterval(gate); ro&&ro.disconnect(); mo&&mo.disconnect(); }catch{} }
      };
    },
    identifier: 'com.danielc0603.immersiveartbg',
    meta: { identifier: 'com.danielc0603.immersiveartbg', name: 'Immersive Art BG', version: '1.4.1' }
  };
}

const plugin = createPlugin();
export default plugin;
