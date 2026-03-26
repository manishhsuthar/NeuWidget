import { Widget } from "./lib/widget.js";
import { autoStart } from "./lib/autostart.js";

const wdg = new Widget({
  draggable: true,
  resizable: true,
  shortcuts: {
    "ctrl+shift+r": () => location.reload(),
  },
});

// ---- below provided code is a usage demonstration, remove it to implement your widget functionalities ----

wdg.onReady(async () => {
  await autoStart();
});

wdg.onReady(() => wdg.poll(updateClock, 1000));

wdg.onReady(async () => {
  const k = await wdg.store.get("someKey");
  if (k) wdg.log(`key: ${k}`, "INFO");
});

wdg.onQuit(asyncClean);
wdg.onQuit(syncClean);

async function asyncClean() {
  await wdg.store.set("someKey", "someValue");

  const val = await wdg.exec("cd ..").catch((error) => wdg.log(error, "ERROR"));
  if (val) wdg.log(`${val.stdOut} ${val.code} ${val.pid} ${val.stdErr}`);

  wdg.log("Starting 3s delay...", "INFO");
  await new Promise((r) => setTimeout(r, 3000));
  wdg.log("defered cleanup", "INFO");
}

function syncClean() {
  wdg.log("fast cleanup, no delay.", "INFO");
}

function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("time").textContent = `${hours}:${minutes}`;

  const day = now.getDate();
  const month = now.toLocaleString("default", { month: "long" });
  document.getElementById("date").textContent = `${getOrdinal(day)} ${month}`;

  document.getElementById("day").textContent = now.toLocaleString("default", {
    weekday: "long",
  });
}

function getOrdinal(n) {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return n + "st";
  if (j === 2 && k !== 12) return n + "nd";
  if (j === 3 && k !== 13) return n + "rd";
  return n + "th";
}
