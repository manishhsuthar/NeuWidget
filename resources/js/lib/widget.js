/**
 * widget.js — NeutralinoJS Widget Scaffolding
 *
 * Usage:
 *   const wdg = new Widget({ draggable: true, fitContent: true });
 *
 *   wdg.onReady(() => { ...your widget logic });
 */
export class Widget {
  constructor(options = {}) {
    this.opts = {
      draggable: options.draggable ?? true,
      fitContent: options.fitContent ?? true,
      dragTarget: options.dragTarget ?? "body",
      alwaysOnTop: options.alwaysOnTop ?? true,
      resizable: options.resizable ?? false,
      shortcuts: options.shortcuts ?? {},
    };

    this._plugins = [];
    this._readyCallbacks = [];
    this._quitCallbacks = [];

    // overriding the actual quit method with _quit so that before quitting we call onQuit
    this._ogQuit = this.quit.bind(this);
    this.quit = this._quit.bind(this);

    Neutralino.init();
    Neutralino.events.on("ready", () => this._boot());
    Neutralino.events.on("windowClose", () => this.quit());
  }

  // Lifecycle

  async _boot() {
    if (this.opts.alwaysOnTop) await Neutralino.window.setAlwaysOnTop(true);
    if (this.opts.fitContent) await this.fitToContent();
    if (this.opts.draggable) this.setupDrag();
    if (this.opts.resizable) this.setupResize();

    this.setupShortcuts({
      "ctrl+q": () => this.quit(),
      ...this.opts.shortcuts,
    });

    for (const plugin of this._plugins) await plugin.init?.(this);
    for (const fn of this._readyCallbacks) await fn(this);
  }

  async show() {
    await Neutralino.window.show();
  }
  async hide() {
    await Neutralino.window.hide();
  }
  async minimize() {
    await Neutralino.window.minimize();
  }
  quit() {
    Neutralino.app.exit();
  }

  onReady(fn) {
    this._readyCallbacks.push(fn);
    return this;
  }

  onQuit(fn) {
    this._quitCallbacks.push(fn);
    return this;
  }

  async _quit() {
    for (const fn of [...this._quitCallbacks].reverse()) {
      try {
        await Promise.resolve(fn(this));
      } catch (e) {
        console.log("error: ", e);
      }
    }
    this._ogQuit();
  }

  // Window

  /**
   * Snap the OS window size to the widget's content.
   * Auto-detects the root element, or pass a selector to be explicit.
   * Call manually if your content changes size after load.
   *
   * @param {string} [selector] - CSS selector of root widget element
   */
  async fitToContent(selector) {
    const candidates = selector
      ? [selector]
      : [".widget", "#widget", "[data-widget]", "body > div:first-child"];

    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const { width, height } = el.getBoundingClientRect();
      const r = window.devicePixelRatio || 1;
      await Neutralino.window.setSize({
        width: Math.ceil(width * r),
        height: Math.ceil(height * r),
      });
      return;
    }
  }

  // Drag

  /**
   * Wire native OS drag to an element. Defaults to dragTarget from options.
   * @param {string} [selector]
   */
  setupDrag(selector) {
    const el = document.querySelector(selector ?? this.opts.dragTarget);
    el?.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("--wdg-handle")) return;
      Neutralino.window.beginDrag();
    });
  }

  // Resize

  /**
   * Injects corner handles into the DOM that let the user resize the window.
   * The widget opens at its natural content size (fitContent), then the user
   * can drag any corner to grow or shrink it.
   *
   * Responsiveness of inner content is the widget author's responsibility —
   * this just enables the window to be resized.
   *
   * Automatically called during boot when resizable: true.
   */
  setupResize() {
    injectResizeStyles();

    // Four corners: which dimension each one controls
    const corners = [
      { id: "nw", cursor: "nwse-resize" },
      { id: "ne", cursor: "nesw-resize" },
      { id: "se", cursor: "nwse-resize" },
      { id: "sw", cursor: "nesw-resize" },
    ];

    for (const corner of corners) {
      const handle = document.createElement("div");
      handle.className = `--wdg-handle --wdg-handle-${corner.id}`;
      handle.style.cursor = corner.cursor;
      document.body.appendChild(handle);
      handle.addEventListener("mousedown", (e) =>
        this._startResize(e, corner.id)
      );
    }
  }

  async _startResize(e, corner) {
    e.preventDefault();
    e.stopPropagation();

    const r = window.devicePixelRatio || 1;

    const startX = e.screenX * r;
    const startY = e.screenY * r;

    const { width: startW, height: startH } = await Neutralino.window.getSize();
    const { x: startPosX, y: startPosY } =
      await Neutralino.window.getPosition();

    const MIN_SIZE = 80;
    const THROTTLE = 40;
    let lastCall = 0;

    const onMouseMove = (e) => {
      const now = Date.now();
      if (now - lastCall < THROTTLE) return;
      lastCall = now;

      const dx = e.screenX * r - startX;
      const dy = e.screenY * r - startY;

      let newW = startW,
        newH = startH,
        newX = startPosX,
        newY = startPosY;

      if (corner === "se") {
        newW = startW + dx;
        newH = startH + dy;
      }
      if (corner === "sw") {
        newW = startW - dx;
        newH = startH + dy;
        newX = startPosX + dx;
      }
      if (corner === "ne") {
        newW = startW + dx;
        newH = startH - dy;
        newY = startPosY + dy;
      }
      if (corner === "nw") {
        newW = startW - dx;
        newH = startH - dy;
        newX = startPosX + dx;
        newY = startPosY + dy;
      }

      newW = Math.max(MIN_SIZE, Math.round(newW));
      newH = Math.max(MIN_SIZE, Math.round(newH));

      Neutralino.window.setSize({ width: newW, height: newH });

      // Move window when dragging from top or left edges to keep opposite edge fixed
      if (corner === "sw")
        Neutralino.window.move(Math.round(newX), Math.round(startPosY));
      if (corner === "ne")
        Neutralino.window.move(Math.round(startPosX), Math.round(newY));
      if (corner === "nw")
        Neutralino.window.move(Math.round(newX), Math.round(newY));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  // Shortcuts

  /**
   * Register keyboard shortcuts. Fires only when this widget's window is focused.
   * Modifiers: ctrl, shift, alt, meta. e.g. 'ctrl+q', 'ctrl+shift+r'
   *
   * @param {object} map - { 'combo': fn }
   */
  setupShortcuts(map) {
    const normalised = {};
    for (const [combo, fn] of Object.entries(map)) {
      normalised[parseCombo(combo)] = fn;
    }
    document.addEventListener("keydown", (e) => {
      const action = normalised[parseEvent(e)];
      if (action) {
        e.preventDefault();
        action();
      }
    });
  }

  get store() {
    if (!this._store) {
      this._store = {
        async get(key) {
          try {
            const data = await Neutralino.storage.getData(String(key));
            return data ? JSON.parse(data) : null;
          } catch (error) {
            Neutralino.debug.log(
              `Error getting key: ${key} - ${error}`,
              "ERROR"
            );
            return null;
          }
        },
        async set(key, value) {
          try {
            await Neutralino.storage.setData(
              String(key),
              JSON.stringify(value)
            );
          } catch (error) {
            Neutralino.debug.log(
              `Error setting key: ${key} - ${error}`,
              "ERROR"
            );
          }
          return this;
        },
        async remove(key) {
          try {
            await Neutralino.storage.remove(String(key));
          } catch (error) {
            Neutralino.debug.log(
              `Error removing key: ${key} - ${error}`,
              "ERROR"
            );
          }
        },

        async getKeys() {
          return await Neutralino.storage.getKeys();
        },

        async clear() {
          await Neutralino.storage.clear();
        },
      };
    }
    return this._store;
  }

  // Helpers

  /**
   * Runs fn immediately, then every ms. Returns a stop() function.
   */
  poll(fn, ms) {
    fn();
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  }

  // Register a plugin with an init(wdg) method
  use(plugin) {
    this._plugins.push(plugin);
    return this;
  }
}

// Resize handle styles
function injectResizeStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .--wdg-handle {
      position: fixed;
      width: 16px;
      height: 16px;
      z-index: 9999;
    }
    .--wdg-handle-nw { top: 0;    left: 0;  }
    .--wdg-handle-ne { top: 0;    right: 0; }
    .--wdg-handle-se { bottom: 0; right: 0; }
    .--wdg-handle-sw { bottom: 0; left: 0;  }
  `;
  document.head.appendChild(style);
}

// Shortcut parsing

function parseCombo(combo) {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((s) => s.trim());
  const mods = ["ctrl", "shift", "alt", "meta"].filter((m) =>
    parts.includes(m)
  );
  const key = parts.find((p) => !["ctrl", "shift", "alt", "meta"].includes(p));
  return [...mods, key].join("+");
}

function parseEvent(e) {
  const mods = [];
  if (e.ctrlKey) mods.push("ctrl");
  if (e.shiftKey) mods.push("shift");
  if (e.altKey) mods.push("alt");
  if (e.metaKey) mods.push("meta");
  return [...mods, e.key.toLowerCase()].join("+");
}
