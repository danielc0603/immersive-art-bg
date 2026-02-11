const path = require("path");

class Plugin {
  constructor(env) {
    this.env = env;
  }

  onRendererReady() {
    this.env.utils.loadJSFrontend(path.join(this.env.dir, "dist/plugin.js"));
  }
}

module.exports = Plugin;
