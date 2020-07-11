import p5 from "p5";

// @ts-ignore
p5.disableFriendlyErrors = true;

interface Drop {
  x: number;
  y: number;
  v: number;

  selected: boolean;
  splattering: number;
}

enum Mode {
  INTRO = 1,
  SELECT,
  STORY,
  DOWNPOUR,
}

export interface State {
  p5: p5;
  rain: Drop[];
  mode: Mode;
}

let X_DIM = window.innerWidth;
let Y_DIM = window.innerHeight - 4;
let MOBILE_HACKS = false;

// Mobile perf hacks
if (Y_DIM > 1024 && Y_DIM > X_DIM) {
  X_DIM = (1024 / Y_DIM) * X_DIM;
  Y_DIM = 1024;
  MOBILE_HACKS = true;
}

const NOT_SPLATTERING = 999;
const MAX_SPLATTER = 10;

const goodbye = () => {
  localStorage.setItem("x", "1");
};
const i_said_goodbye = () => {
  return localStorage.getItem("x");
};

export function setup(sketch: p5): State {
  const canvas = sketch.createCanvas(X_DIM, Y_DIM).elt;
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  let raindrops = 20;
  let mode = Mode.INTRO;
  let v = 1;
  if (i_said_goodbye()) {
    raindrops = 300;
    mode = Mode.DOWNPOUR;
    v = 4;
  } else {
    const t = document.getElementById("text")!;
    t.innerText = "It is raining...";
    t.className = "text fade-in";
  }

  const drops = Array<Drop>(raindrops)
    .fill({} as Drop)
    .map((_) => ({
      x: Math.random() * X_DIM,
      y: Math.random() * Y_DIM,
      v,
      selected: false,
      splattering: NOT_SPLATTERING,
    }));

  return { p5: sketch, rain: drops, mode };
}

export function updateState(state: State): void {
  let time_scale = 1;
  switch (state.mode) {
    case Mode.INTRO: {
      // time_scale = 2;
      break;
    }
    case Mode.SELECT: {
      time_scale = 0.1;
      break;
    }
    case Mode.STORY: {
      time_scale = 0;
      break;
    }
    case Mode.DOWNPOUR: {
      break;
    }
  }

  const accel = 0.01;
  const terminal_velocity = 5;

  for (const drop of state.rain) {
    // Normal mode
    if (drop.splattering === NOT_SPLATTERING) {
      drop.y += drop.v * time_scale;
      const jitter = (0.5 - Math.random()) * 0.01; // -0.005 to 0.005
      drop.v = Math.min(
        drop.v + (accel + jitter) * time_scale,
        terminal_velocity
      );

      // 60% chance to splat after a certain point
      if (drop.y > Y_DIM - 80 && Math.random() < 0.6) {
        drop.splattering = MAX_SPLATTER;
        // Force it if it goes too far
      } else if (drop.y > Y_DIM - 20) {
        drop.splattering = MAX_SPLATTER;
      }

      // Splatter mode
    } else {
      drop.splattering -= 1 * time_scale;
    }
  }

  state.rain = state.rain.filter((drop) => drop.splattering > 0);

  if (state.mode !== Mode.DOWNPOUR) {
    if (Math.random() < 0.2 * time_scale) {
      state.rain.push({
        x: Math.random() * X_DIM,
        y: Math.random() * 10,
        v: 1,
        selected: false,
        splattering: NOT_SPLATTERING,
      });
    }
  } else {
    for (let i = 0; i < 2; i++) {
      state.rain.push({
        x: Math.random() * X_DIM,
        y: Math.random() * 10,
        v: 4,
        selected: false,
        splattering: NOT_SPLATTERING,
      });
    }
  }

  if (state.p5.frameCount === 60 * 3) {
    const t = document.getElementById("text")!;
    t.className = "text fade-out";
  }

  if (state.p5.frameCount > 60 * 5 && state.mode === Mode.INTRO) {
    state.mode = Mode.SELECT;

    const t = document.getElementById("text")!;
    t.innerText = "Choose your raindrop";
    t.className = "text fade-in";

    const mouseClick = () => {
      const x = state.p5.mouseX;
      const y = state.p5.mouseY;
      let range = MOBILE_HACKS ? 32 : 8;
      const maybeDrop = state.rain.find(
        (drop) => Math.abs(x - drop.x) < range && Math.abs(y - drop.y) < range
      );
      if (maybeDrop) {
        maybeDrop.selected = true;
        state.mode = Mode.STORY;

        state.p5.mouseClicked = () => {};
        if (MOBILE_HACKS) {
          state.p5.touchStarted = () => {};
        }

        // Animations
        t.className = "text fade-out";
        setTimeout(() => {
          t.innerText = "This is your raindrop.";
          t.className = "text fade-in";
        }, 1000);
        setTimeout(() => {
          t.className = "text fade-out";
        }, 4000);
        setTimeout(() => {
          t.innerText = "Please keep an eye on it, and take good care of it.";
          t.className = "text fade-in";
        }, 5000);
        setTimeout(() => {
          t.className = "text fade-out";
        }, 8000);
        setTimeout(() => {
          t.innerText = "You won't be getting another one.";
          t.className = "text fade-in";
        }, 9000);
        setTimeout(() => {
          t.className = "text fade-out";
        }, 12000);
        setTimeout(() => {
          state.mode = Mode.DOWNPOUR;
          goodbye();
        }, 13000);
      }
      return false;
    };
    state.p5.mouseClicked = mouseClick;

    if (MOBILE_HACKS) {
      state.p5.touchStarted = mouseClick;
    }
  }
}

export function draw(sketch: p5, state: State) {
  sketch.background(64, 64, 64);
  let pointerCursor = false;
  const selectable = state.mode === Mode.SELECT;
  for (const drop of state.rain) {
    if (drop.splattering === NOT_SPLATTERING) {
      sketch.strokeWeight(2);
      sketch.stroke(180, 180, 230);
      sketch.point(drop.x, drop.y);

      const tailLength = Math.round(drop.v * 2.5);
      for (let i = 0; i < tailLength; i++) {
        sketch.stroke(
          180 + 10 * (i + 1),
          180 + 10 * (i + 1),
          230 + 5 * (i + 1)
        );
        sketch.point(drop.x, drop.y - i);
      }

      // Selection logic
      if (drop.selected && state.mode !== Mode.DOWNPOUR) {
        sketch.strokeWeight(2);
        sketch.stroke("#FF0000");
        sketch.noFill();
        sketch.circle(drop.x, drop.y - tailLength / 2, 24);
      } else if (
        selectable &&
        Math.abs(sketch.mouseX - drop.x) < 8 &&
        Math.abs(sketch.mouseY - drop.y) < 8
      ) {
        sketch.strokeWeight(1);
        sketch.stroke("#FF8888");
        sketch.noFill();
        sketch.circle(drop.x, drop.y - tailLength / 2, 24);
        pointerCursor = true;
      }
    } else {
      // Splatters
      sketch.strokeWeight(1);
      sketch.stroke(180, 180, 230);
      const angles = [
        { dx: -0.7, dy: 0.7 },
        { dx: 0, dy: 1 },
        { dx: 0.7, dy: 0.7 },
      ];
      for (const angle of angles) {
        const { dx, dy } = angle;
        sketch.point(
          drop.x + dx * (MAX_SPLATTER - drop.splattering),
          drop.y - dy * (MAX_SPLATTER - drop.splattering)
        );
      }
    }
  }

  if (pointerCursor && selectable) {
    sketch.cursor("pointer");
  } else {
    sketch.cursor("default");
  }

  return state;
}
