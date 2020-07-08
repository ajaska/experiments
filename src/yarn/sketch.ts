import p5 from "p5";

interface Being {
  x: number;
  y: number;

  color: string;
}

export interface State {
  p5: p5;
  beings: { [name: string]: Being };
}

const X_DIM = window.innerWidth;
const Y_DIM = window.innerHeight - 4;

export function setup(sketch: p5): State {
  sketch.createCanvas(X_DIM, Y_DIM);

  sketch.background(250, 245, 235);

  const mom = {
    x: -16,
    y: 0,
    color: "pink",
  };

  const dad = {
    x: 16,
    y: 0,
    color: "blue",
  };

  return { p5: sketch, beings: { mom, dad } };
}

export function updateState(state: State): void {
  const frames = state.p5.frameCount;

  if (frames > 64 && frames < 5000) {
    state.beings.mom.x = -16 * Math.cos((frames / 64) * Math.PI * 2);
    state.beings.dad.x = 16 * Math.cos((frames / 64) * Math.PI * 2);
  }

  if (frames === 128 + 16) {
    const you = {
      x: 0,
      y: 0,
      color: "#FF0000",
    };
    state.beings.you = you;
  }

  // state.beings.you.y -= 1;
}

export function draw(sketch: p5, state: State) {
  sketch.copy(0, 0, X_DIM, Y_DIM, 0, 1, X_DIM, Y_DIM);

  // Move center to 0, 0
  sketch.translate(X_DIM / 2, Y_DIM / 2);

  sketch.strokeWeight(2);
  for (const being of Object.values(state.beings)) {
    sketch.stroke(being.color);
    sketch.point(being.x, being.y);
  }

  return state;
}
