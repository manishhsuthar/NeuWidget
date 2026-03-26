## NeuWidget

A tiny, Electron free, framework for building desktop widgets with [NeutralinoJS](https://neutralino.js.org/)

**Use this Repository as a template to get a ready-to-use project folder.**

> This repository implements a simple clock widget to demonstrate usage. Extend it to build your own custom widgets.

## Features

- AutoStart - the widget auto starts across system reboot
- Draggable - click and hold anywhere to move the widget
- Resizable - optional corner handles to grow or shrink the window
- K/V Store - provides key/value persistence with a .storage file
- Shortcuts - implement keyboard shortcuts.
- Pluggable - extend with your own plugins via wdg.use(plugin)

## Widget Developer's Guide:

Step 1: Install neutralino.js globally:

```bash
npm install -g @neutralinojs/neu
```

Step 2: cd to the project and generate the build folders:

```bash
neu update && neu build --embed-resources
```

> Strictly recommended to use the `--embed-resources` flag while building the app. It embeds the `resources.neu` file, avoiding the need to provide it to end user.

Step 3: Run the program:

```bash
neu run
```

Modify the `main.js` file to implement functionalities:

```js
const wdg = new Widget({
  draggable: true, // click and drag to move
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

### Distribution:

Widget Developers are recommended to provide the widget binaries from `/dist` and NOT from `/bin`, , as they are only used during development.

The most advisable approach to distribute the developed widget is by providing the binaries for all Operating Systems.

**First Run Behavior:**
After downloading the widget binary, the user should execute it once manually. During the first run, NeuWidget automatically registers the widget with the operating system's startup mechanism.

After this initial run, the widget will automatically start whenever
the user logs into their system.

---

**Folder Structure:**

```
NeuWidget/
├─ neutralino.config.json
├─ .gitignore
├─ bin/
├─ dist/                     ← widget binaries
└─ resources/
   ├─ index.html             ← your widget structure
   ├─ styles.css             ← your widget styles
   ├─ icons/                 ← icons and other images
   └─ js/
      ├─ main.js             ← your widget logic (ESM compliant)
      ├─ core/
      │  └─ neutralino.d.ts  ← Neutralino type definitions
      │  └─ neutralino.js    ← Neutralino runtime
      └─ lib/
         ├─ widget.js        ← core widget library
         └─ autostart.js     ← auto start code
```
