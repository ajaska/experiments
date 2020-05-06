const WEIGHTS = [300, 400, 500, 600];

function random<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("Array too short");
  return arr[Math.floor(Math.random() * arr.length)];
}

let frame = 0;

const TRANSPARENT = "rgba(0, 0, 0, 0)";
const WHITE = "#ffffff";
const BLUE = "#0000ff";

function fontAnim() {
  const container = document.getElementById("mainText");
  if (!container) throw new Error("Couldn't find text");

  const beat = frame % 4;
  const measure = Math.floor(frame / 4);

  if (beat === 0) {
    {
      container.style.color = WHITE;
      container.style.backgroundColor = BLUE;
      container.style.fontStyle = "italic";
    }
    setTimeout(() => {
      container.style.color = BLUE;
      container.style.backgroundColor = TRANSPARENT;
      container.style.fontStyle = "normal";
    }, 100);

    setTimeout(() => {
      container.style.color = WHITE;
      container.style.backgroundColor = BLUE;
      container.style.fontStyle = "italic";
    }, 200);

    setTimeout(() => {
      container.style.color = BLUE;
      container.style.backgroundColor = TRANSPARENT;
      container.style.fontStyle = "normal";
    }, 300);
  }

  if (measure % 2 === 0) {
    // container.style.color = WHITE;
    // container.style.backgroundColor = BLUE;
    container.style.fontWeight = String(WEIGHTS[beat]);
    container.style.removeProperty("-webkit-text-stroke");
  } else if (measure % 2 === 1) {
    // container.style.color = BLUE;
    // container.style.backgroundColor = WHITE;
    container.style.fontWeight = String(WEIGHTS[WEIGHTS.length - 1 - beat]);
    container.style.removeProperty("-webkit-text-stroke");
  } else if (measure % 4 === 2) {
    container.style.color = BLUE;
    container.style.backgroundColor = BLUE;
    container.style.setProperty("-webkit-text-stroke", `2px ${WHITE}`);

    container.style.fontWeight = String(WEIGHTS[beat]);
  } else if (measure % 4 === 3) {
    container.style.color = WHITE;
    container.style.backgroundColor = WHITE;
    container.style.setProperty("-webkit-text-stroke", `2px ${BLUE}`);

    container.style.fontWeight = String(WEIGHTS[WEIGHTS.length - 1 - beat]);
  }

  frame++;
  console.log(`${measure + 1}.${beat + 1}`);
}

function slideyBoi() {
  const app = document.getElementById("appContainer")!;
  const div1 = document.createElement("div");
  const div2 = document.createElement("div");
  const div3 = document.createElement("div");
  const div4 = document.createElement("div");
  setTimeout(() => {
    div1.style.color = BLUE;
    div1.style.backgroundColor = TRANSPARENT;
    div1.style.fontStyle = "normal";
    div1.style.fontSize = "144px";
    div1.style.fontWeight = String(WEIGHTS[0]);
    div1.style.position = "absolute";
    div1.style.top = "4px";
    // div1.style.top = "0px";
    div1.style.left = "4px";
    div1.innerText = "@ajaska";
    app.appendChild(div1);
  }, 0);

  setTimeout(() => {
    div2.style.setProperty("-webkit-text-stroke", `2px ${BLUE}`);
    div2.style.color = TRANSPARENT;
    div2.style.backgroundColor = TRANSPARENT;
    div2.style.fontStyle = "normal";
    div2.style.fontSize = "144px";
    div2.style.fontWeight = String(WEIGHTS[1]);
    div2.style.position = "absolute";
    // div2.style.top = "8px";
    div2.style.top = "0px";
    div2.style.left = "8px";
    div2.innerText = "@ajaska";
    app.appendChild(div2);
  }, 50);

  setTimeout(() => {
    //div3.style.color = BLUE;
    div3.style.setProperty("-webkit-text-stroke", `2px ${BLUE}`);
    div3.style.color = TRANSPARENT;
    div3.style.backgroundColor = TRANSPARENT;
    div3.style.fontStyle = "normal";
    div3.style.fontSize = "144px";
    div3.style.fontWeight = String(WEIGHTS[2]);
    div3.style.position = "absolute";
    div3.style.top = "12px";
    // div3.style.top = "0px";
    div3.style.left = "12px";
    div3.innerText = "@ajaska";
    app.appendChild(div3);
  }, 100);

  setTimeout(() => {
    div4.style.setProperty("-webkit-text-stroke", `2px ${BLUE}`);
    div4.style.color = TRANSPARENT;
    // div4.style.color = BLUE;
    div4.style.backgroundColor = TRANSPARENT;
    div4.style.fontStyle = "normal";
    div4.style.fontSize = "144px";
    div4.style.fontWeight = String(WEIGHTS[3]);
    div4.style.position = "absolute";
    div4.style.top = "16px";
    // div4.style.top = "0px";
    div4.style.left = "16px";
    div4.innerText = "@ajaska";
    app.appendChild(div4);
  }, 150);

  setTimeout(() => {
    app.removeChild(div4);
  }, 200);
  setTimeout(() => {
    app.removeChild(div3);
  }, 225);
  setTimeout(() => {
    app.removeChild(div2);
  }, 250);
  setTimeout(() => {
    app.removeChild(div1);
  }, 275);
}

let intervalId: number;
const BPM = 182;
console.log("target bpm", BPM);
console.log("time between beats", Math.round((60 * 1000) / BPM));
console.log("best bpm", (60 * 1000) / Math.round((60 * 1000) / BPM));

const initAnim = (bpm?: number) => {
  // TODO better timing
  if (intervalId != null) clearInterval(intervalId);
  frame = 0;
  fontAnim();
  intervalId = setInterval(fontAnim, Math.round((60 * 1000) / (bpm || BPM)));
};

setTimeout(() => initAnim(), 100);

window.onclick = () => {
  initAnim();
};

let count = 0;
let bpmAvg: number | null = null;
let msecsFirst = 0;
let msecsPrevious = 0;

function resetCount() {
  count = 0;
  bpmAvg = null;
  document.getElementById("bpm-avg")!.innerText = "";
}

function tapForBPM(e: KeyboardEvent) {
  if (e.key === "r") {
    resetCount();
    return;
  }
  if (e.key === "c" && bpmAvg != null) {
    initAnim(bpmAvg);
  }
  if (e.key === "s") {
    slideyBoi();
    return;
  }
  if (e.key !== "x") {
    return;
  }
  const msecs = performance.now();

  const display = document.getElementById("bpm-avg");
  if (bpmAvg != null && msecs - msecsPrevious > 1000 * bpmAvg) {
    count = 0;
  }

  if (count == 0) {
    display!.innerText = "FIRST BEAT";
    msecsFirst = msecs;
    count = 1;
  } else {
    bpmAvg = (60000 * count) / (msecs - msecsFirst);
    display!.innerText = String(Math.round(bpmAvg * 100) / 100);
    count++;
  }
  msecsPrevious = msecs;
  return true;
}

setInterval(() => {
  if (bpmAvg == null) return;

  const msecs = performance.now();

  if (msecs - msecsPrevious > 2000) {
    resetCount();
  }
}, 2000);

document.onkeypress = tapForBPM;
