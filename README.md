## NeuWidget

A tiny scaffolding layer for building desktop widgets with [NeutralinoJS](https://neutralino.js.org/) - an Electron-free GUI framework.

**Use this Repository as a template to get a ready-to-use project folder.**

> This repository implements a simple clock widget to demonstrate usage. Extend it to build your own custom widgets.

## Features

- Draggable - click and hold anywhere to move the widget
- Resizable - optional corner handles to grow or shrink the window
- K/V Store - Wraps Neutralino Storage API to provide key/value persistence
- Shortcuts - implement keyboard shortcuts.
- Pluggable - extend with your own plugins via wdg.use(plugin)

## Usage

Step 1: Install neutralino.js globally:

```bash
npm install -g @neutralinojs/neu
```

Step 2: cd to the project and generate the build folders:

```bash
neu update && neu build
```

Step 3: Run the program:

```bash
neu run
```

Modify the `main.js` file to implement functionalities:

```js
const wdg = new Widget({
  draggable: true, // click and drag to move
  fitContent: true, // window snaps to content size on load
  alwaysOnTop: true, // stay above other windows
  resizable: true, // set true to enable corner resize handles
  shortcuts: {
    // ctrl+q to quit is built in — add your own here:
    // "ctrl+h": () => wdg.hide(),
  },
});

wdg.onReady(() => {
  // your widget logic here
});
```

---

### Preview:

<img width="1920" height="1080" alt="preview" src="https://github.com/user-attachments/assets/823049f9-e188-47ab-a35b-8f61531d2a77" />

---

**Note: The widget only appears as long as the program runs. A "run in background" feature is yet to be implemented.**
