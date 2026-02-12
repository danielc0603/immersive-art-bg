# 🎨 Immersive Art BG

**Version:** 1.4.7  
**Author:** [@danielc0603](https://github.com/danielc0603)  
**Compatibility:** Cider 1.4.2+ (macOS, Windows, Linux)

---
## Note

Only tested  on macOS, unsure if it has Windows/Linux Compatability

---

## 🖼️ Overview

**Immersive Art BG** transforms your Cider experience with dynamic, high-resolution album art backgrounds.  
It automatically syncs with the currently playing track and applies a customizable *blur, dim, and vignette* for a cinematic “liquid glass” look — while keeping the interface crisp and readable.

---

## ✨ Features

- **Automatic album art detection** — syncs in real-time with the current track.  
- **Customizable visual controls:**  
  - **Blur:** 0 – 100 px  
  - **Dim:** 0 – 1  
  - **Vignette:** 0 – 1  
- **Settings saved locally** (persist across sessions).  
- **Static control panel** — clean, non-draggable, and always accessible.  

---

## 📦 Installation

### Using macOS Terminal

1. ```
   cd ~/Downloads
   curl -L -o immersive-art-bg-1.4.3.zip \
   https://github.com/danielc0603/immersive-art-bg/releases/download/v1.4.3/immersive-art-bg-1.4.3.zip
   ```

2. ```
   unzip immersive-art-bg-1.4.3.zip -d immersive-art-bg
   ```

3. ```
   DEST="$HOME/Library/Application Support/sh.cider.genten/plugins/com.danielc0603.immersiveartbg"
   mkdir -p "$DEST"
   cp -f immersive-art-bg/* "$DEST/"
   ```


Until approved by admin, can be run locally from '/Users/yourusername/Library/Application Support/sh.cider.genten/plugins' folder:
  Cider -> Devtools -> Console
  ```
  await (async () => {
  const pluginPath = '/Users/yourusername/Library/Application Support/sh.cider.genten/plugins/com.danielc0603.immersiveartbg/plugin.js';
  const mod = await import('file://' + encodeURI(pluginPath));
  mod.default?.();
  console.log("[ImmersiveArtBG] manually loaded from local path.");
})();
```
