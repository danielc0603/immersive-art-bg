/* Immersive Art BG */
function ImmersiveArtBG() {
  const mk = MusicKit.getInstance();

  const defaults = { blurPx: 32, dim: 0.35, vignette: 0.35 };
  const saved = JSON.parse(localStorage.getItem('iab-settings') || '{}');
  const cfg = { ...defaults, ...saved };
  const save = () => localStorage.setItem('iab-settings', JSON.stringify(cfg));

  const ID = { style: 'iab-style', layer: 'iab-bg', panel: 'iab-panel', btn: 'iab-btn' };
  const $  = id => document.getElementById(id);

  function ensureStyle() {
    if ($(ID.style)) return;
    const css = `
:root{ --iab-blur:${cfg.blurPx}px; --iab-dim:${cfg.dim}; --iab-vignette:${cfg.vignette}; }
#${ID.layer}{
  position:fixed; inset:0; background-size:cover; background-position:center;
  transform:scale(1.06); pointer-events:none; z-index:0;
  filter: blur(var(--iab-blur)) !important;
}
#${ID.layer}::after{
  content:""; position:absolute; inset:0;
  background:
    radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,var(--iab-vignette)) 100%),
    rgba(0,0,0,var(--iab-dim));
}
#app{ position:relative; z-index:1; }
#${ID.btn}{
  position:fixed; top:10px; right:86px; width:28px; height:28px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:rgba(30,30,30,.85); color:#fff; border:1px solid rgba(255,255,255,.12);
  cursor:pointer; z-index:2147483647; backdrop-filter:saturate(120%) blur(6px);
  -webkit-app-region:no-drag; pointer-events:auto;
}
#${ID.panel}{
  position:fixed; top:44px; right:20px; width:clamp(260px,24vw,360px); max-height:calc(100vh - 70px); overflow:auto;
  background:rgba(20,20,20,.92); color:#eee; border:1px solid rgba(255,255,255,.12); border-radius:10px;
  padding:12px; font:12px/1.3 -apple-system,system-ui; backdrop-filter:saturate(120%) blur(8px);
  z-index:2147483646; -webkit-app-region:no-drag; pointer-events:auto; display:none;
}
#${ID.panel} h3{margin:0 0 8px; font:600 13px -apple-system,system-ui;}
#${ID.panel} .row{display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; margin:8px 0;}
#${ID.panel} .row label{white-space:nowrap;}
#${ID.panel} .row input[type=range]{width:100%;}
#${ID.panel} .row .val{min-width:48px; text-align:right; opacity:.9;}
#${ID.panel} .reset{ margin-top:10px; width:100%; padding:6px 0; border:none; border-radius:6px;
  background:#c62828; color:#fff; font-weight:600; cursor:pointer; }
#${ID.panel} .reset:hover{ background:#b71c1c; }
`;
    const s = document.createElement('style'); s.id = ID.style; s.textContent = css; document.head.appendChild(s);
  }

  function ensureLayer() {
    if ($(ID.layer)) return;
    const el = document.createElement('div'); el.id = ID.layer; document.body.prepend(el);
  }

  const artFrom = (item, size) =>
    item?.attributes?.artwork?.url?.replace?.('{w}x{h}', `${size}x${size}`) || '';

  function setBG(url) {
    if (!url) return; ensureLayer();
    const el = document.getElementById('iab-bg'); el.style.backgroundImage = `url("${url}")`;
  }

  function applyVars() {
    document.documentElement.style.setProperty('--iab-blur', `${cfg.blurPx}px`);
    document.documentElement.style.setProperty('--iab-dim', cfg.dim);
    document.documentElement.style.setProperty('--iab-vignette', cfg.vignette);
    const el = document.getElementById('iab-bg'); if (el) el.style.filter = `blur(${cfg.blurPx}px)`;
  }

  function applyArt() {
    const url = artFrom(MusicKit.getInstance().nowPlayingItem, 2000); setBG(url); applyVars();
  }

  function mkRow(labelText, min, max, step, key) {
    const row = document.createElement('div'); row.className='row';
    const lab=document.createElement('label'); lab.textContent=labelText;
    const input=document.createElement('input'); input.type='range'; input.min=min; input.max=max; input.step=step; input.value=cfg[key];
    const val=document.createElement('div'); val.className='val';
    const fmt=v=> key==='blurPx'?`${Math.round(v)}px`:(Math.round(v*100)/100).toString();
    val.textContent=fmt(cfg[key]);
    input.oninput=e=>{ cfg[key]=parseFloat(e.target.value); save(); val.textContent=fmt(cfg[key]); applyVars(); };
    row.append(lab,input,val); return row;
  }

  function ensureControls() {
    let btn=document.getElementById('iab-btn');
    if(!btn){ btn=document.createElement('button'); btn.id='iab-btn'; btn.title='Immersive Art Settings'; btn.textContent='🎨';
      ['mousedown','click'].forEach(ev=>btn.addEventListener(ev,e=>e.stopPropagation())); document.body.appendChild(btn); }
    let panel=document.getElementById('iab-panel');
    if(!panel){ panel=document.createElement('div'); panel.id='iab-panel';
      ['mousedown','click'].forEach(ev=>panel.addEventListener(ev,e=>e.stopPropagation()));
      const h=document.createElement('h3'); h.textContent='Immersive Art BG'; panel.appendChild(h);
      panel.appendChild(mkRow('Blur',0,100,1,'blurPx'));
      panel.appendChild(mkRow('Dim',0,1,0.01,'dim'));
      panel.appendChild(mkRow('Vignette',0,1,0.01,'vignette'));
      const resetBtn=document.createElement('button'); resetBtn.className='reset'; resetBtn.textContent='Reset to Defaults';
      resetBtn.onclick=()=>{ Object.assign(cfg, {blurPx:32, dim:0.35, vignette:0.35}); save();
        const rows=panel.querySelectorAll('.row'); const vals=[cfg.blurPx,cfg.dim,cfg.vignette];
        rows.forEach((r,i)=>{ const inp=r.querySelector('input[type=range]'); const val=r.querySelector('.val');
          inp.value=vals[i]; val.textContent=(i===0?`${Math.round(vals[i])}px`:(Math.round(vals[i]*100)/100)); });
        applyVars(); };
      panel.appendChild(resetBtn); document.body.appendChild(panel);
    }
    btn.onclick=()=>{ panel.style.display=(panel.style.display==='none'||!panel.style.display)?'block':'none'; };
  }

  ensureStyle(); ensureLayer(); ensureControls(); applyVars();
  mk.addEventListener('mediaItemDidChange', applyArt);
  mk.addEventListener('nowPlayingItemDidChange', applyArt);
  applyArt();
}

/* >>>>>>>>>> IMPORTANT: expose identifier on the default export <<<<<<<<<< */
ImmersiveArtBG.identifier = 'com.danielc0603.immersiveartbg';
ImmersiveArtBG.meta = {
  identifier: 'com.danielc0603.immersiveartbg',
  name: 'Immersive Art BG',
  version: '1.1.2'
};

export default ImmersiveArtBG;
