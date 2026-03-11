const wdg = new Widget({
  draggable: true,
  fitContent: true,
  resizable: true,
  shortcuts: {
    "ctrl+shift+r": () => location.reload(),
  },
});

wdg.onReady(() => {
  wdg.poll(updateClock, 1000);
  wdg.onQuit(asyncClean);
  wdg.onQuit(syncClean);
});

async function asyncClean() {
  Neutralino.debug.log("Starting 3s delay...");
  await new Promise((r) => setTimeout(r, 3000));
  Neutralino.debug.log("defered cleanup", "INFO");
}

async function syncClean() {
  Neutralino.debug.log("fast cleanup, no delay.");
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
