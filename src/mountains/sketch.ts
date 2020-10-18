import p5 from "p5";

export interface State {
  p5: p5;
  previousWalk: number[];
  y: number;
}

const BORDER_WIDTH = 40;

const X_DIM = 800;
const Y_DIM = 800;

const X_MIN = 0;
const Y_MIN = 0;

const X_MAX = X_DIM;
const Y_MAX = Y_DIM;

export function setup(sketch: p5): State {
  sketch.createCanvas(X_DIM, Y_DIM);
  sketch.background(238, 232, 220);

  return {
    p5: sketch,
    previousWalk: rangeN(X_MAX - X_MIN).map((_) => 0),
    y: Y_MIN,
  };
}

export function updateState(state: State): State {
  return state;
}

function randJump(state: State) {
  return state.p5.randomGaussian(50, 20);
}

function randAngle(state: State) {
  const angleDeg = state.p5.random(-15, 15);
  const angleRad = state.p5.radians(angleDeg);
  return angleRad;
}

function randStroke(state: State) {
  return state.p5.random(64, 196);
}

function rangeN(n: number) {
  return [...Array(n).keys()];
}

export function draw(sketch: p5, state: State) {
  let { y, previousWalk } = state;

  // Vertical lines
  {
    const angle = randAngle(state);
    const stroke = randStroke(state);
    sketch.stroke(stroke);

    let x1 = 0;
    while (x1 < X_MAX - X_MIN) {
      const y1 = previousWalk[x1];
      const d_y = Y_MAX - y1;
      // Trigonometry to find intercept
      const x2 = d_y * Math.tan(angle) + x1;

      sketch.strokeWeight(sketch.randomGaussian(2, 0.5));
      sketch.line(x1 + X_MIN, y1, x2, y1 + d_y);
      x1 += Math.round(sketch.random(3, 7));
    }
  }

  let currentWalk: number[] = [];
  currentWalk.push(y);
  if (y >= Y_MAX) {
    sketch.noLoop();
  } else {
    const jump = randJump(state);

    // Perform random walk
    let x = 1;
    while (x < X_MAX - X_MIN) {
      let nextWalkValue = currentWalk[x - 1] + sketch.random(-3, 3);
      nextWalkValue = Math.max(nextWalkValue, previousWalk[x]);
      nextWalkValue = Math.min(nextWalkValue, Y_MAX);
      currentWalk.push(nextWalkValue);

      x += 1;
    }
    sketch.fill(238, 232, 220);
    sketch.stroke(238, 232, 220);
    sketch.strokeWeight(6);
    sketch.beginShape();

    sketch.vertex(X_MIN, y);
    currentWalk.forEach((y1, x1) => {
      sketch.curveVertex(X_MIN + x1, y1);
    });
    sketch.vertex(X_MAX, Y_MAX);
    sketch.vertex(X_MIN, Y_MAX);
    sketch.vertex(X_MIN, y);
    sketch.endShape();

    // Update state; maybe figure out later why it don't walk so good
    state.previousWalk = currentWalk;
    state.y += jump;
  }

  // Draw border
  sketch.noStroke();
  sketch.fill(238, 232, 220);
  sketch.rect(X_MIN, Y_MIN, X_MAX, BORDER_WIDTH);
  sketch.rect(X_MIN, Y_MIN, BORDER_WIDTH, Y_MAX);
  sketch.rect(X_MIN, Y_MAX - BORDER_WIDTH, X_MAX, BORDER_WIDTH);
  sketch.rect(X_MAX - BORDER_WIDTH, Y_MIN, BORDER_WIDTH, Y_MAX);

  return state;
}
