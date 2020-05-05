import p5 from "p5";

interface Vector {
  dx: number;
  dy: number;
}

interface Boid {
  id: number;

  x: number;
  y: number;
  v: Vector;
}

export interface State {
  boids: Boid[];

  p5: p5;
}

const NEARBY_THRESHOLD = 50;
const FLOCKING_FACTOR = 0.005;
const DISTANCE_THRESHOLD = 20;
const MATCHING_FACTOR = 0.25; //0.125;

const X_DIM = 600;
const Y_DIM = 600;

let dist: (x1: number, y1: number, x2: number, y2: number) => number;

export function setup(sketch: p5): State {
  dist = sketch.dist;

  const RANDOM_SEED = 4;
  const NUM_BOIDS = 100;
  const FRAME_RATE = 30;

  sketch.createCanvas(X_DIM, Y_DIM);
  sketch.frameRate(FRAME_RATE);

  sketch.randomSeed(RANDOM_SEED);
  const boids: Boid[] = [];
  // Old-school for-loop wow
  for (let i = 0; i < NUM_BOIDS; i++) {
    boids.push({
      id: i,
      x: sketch.random(0, X_DIM),
      y: sketch.random(0, Y_DIM),
      v: {
        dx: sketch.random(-5, 5),
        dy: sketch.random(-5, 5),
      },
    });
  }

  return { boids, p5: undefined } as any;
}

// Returns a vector diff for Rule 1
function flyToCenterOfFlock(boid: Boid, otherBoids: Boid[]): Vector {
  let flockX = 0;
  let flockY = 0;

  // Compute average of positions
  for (const otherBoid of otherBoids) {
    flockX += otherBoid.x;
    flockY += otherBoid.y;
  }
  flockX /= otherBoids.length;
  flockY /= otherBoids.length;

  // Compute vector difference
  let dx = flockX - boid.x;
  let dy = flockY - boid.y;

  // Scale by flocking factor (%) in that direction
  dx *= FLOCKING_FACTOR;
  dy *= FLOCKING_FACTOR;

  return { dx, dy };
}

// Returns a vector diff for Rule 2
function maintainDistance(boid: Boid, otherBoids: Boid[]): Vector {
  let pushV = { dx: 0, dy: 0 };
  for (const otherBoid of otherBoids) {
    const d = dist(boid.x, boid.y, otherBoid.x, otherBoid.y);
    if (d < DISTANCE_THRESHOLD) {
      pushV.dx -= (otherBoid.x - boid.x) / d;
      pushV.dy -= (otherBoid.y - boid.y) / d;
    }
  }

  // pushV.dx /= 15;
  // pushV.dy /= 15;

  return pushV;
}

// Rule 3
function matchVelocity(boid: Boid, otherBoids: Boid[]): Vector {
  let v = { dx: 0, dy: 0 };

  // Calculate average velocity
  for (const otherBoid of otherBoids) {
    v.dx += otherBoid.v.dx;
    v.dy += otherBoid.v.dy;
  }
  v.dx /= otherBoids.length;
  v.dy /= otherBoids.length;

  // Compute delta
  v.dx = v.dx - boid.v.dx;
  v.dy = v.dy - boid.v.dy;

  // Scale
  v.dx *= MATCHING_FACTOR;
  v.dy *= MATCHING_FACTOR;

  return v;
}

function stayInBounds(boid: Boid): Vector {
  let v = { dx: 0, dy: 0 };

  if (boid.x < 10) v.dx += 10;
  if (boid.y < 10) v.dy += 10;
  if (boid.x > X_DIM - 10) v.dx -= 10;
  if (boid.y > Y_DIM - 10) v.dy -= 10;

  return v;
}

function moveTowardsMouse(boid: Boid, mouseX: number, mouseY: number): Vector {
  if (mouseX > 0 && mouseX < X_DIM && mouseY > 0 && mouseY < Y_DIM) {
    return {
      dx: (mouseX - boid.x) / 10000,
      dy: (mouseY - boid.y) / 10000,
    };
  }
  return { dx: 0, dy: 0 };
}

function isNeighbor(boid: Boid, otherBoid: Boid): boolean {
  let x = otherBoid.x - boid.x;

  // if (x > X_DIM / 2) {
  //   x = X_DIM - x;
  // } else if (x < -X_DIM / 2) {
  //   x = -x - X_DIM;
  // }
  // if (x > X_DIM / 2) x = X_DIM - x;
  // x = Math.min(Math.abs(x), Math.abs(x + X_DIM), Math.abs(x - X_DIM));
  let y = otherBoid.y - boid.y;

  // if (y > Y_DIM / 2) {
  //   y = Y_DIM - y;
  // } else if (y < -Y_DIM / 2) {
  //   y = -y - Y_DIM;
  // }
  // y = Math.min(Math.abs(y), Math.abs(y + Y_DIM), Math.abs(y - Y_DIM));
  // if (y > Y_DIM / 2) y = Y_DIM - y;

  const R = Math.sqrt(x * x + y * y);

  if (R > NEARBY_THRESHOLD) return false;

  const A = Math.atan2(y, x);

  const boidAngle = Math.atan2(boid.v.dy, boid.v.dx);

  // Normalized angle diff (in radians)
  let angleDiff = A - boidAngle;
  if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

  return Math.abs(angleDiff) < (Math.PI * 2) / 4;
}

function newBoidVector(boid: Boid, state: State): Vector {
  const otherBoids = state.boids
    .filter((someBoid) => boid.id !== someBoid.id)
    .filter(
      (someBoid) => isNeighbor(boid, someBoid)
      // dist(someBoid.x, someBoid.y, boid.x, boid.y) < NEARBY_THRESHOLD
    );

  let vectors: Vector[] = [];
  if (otherBoids.length === 0) {
    // vectors = [stayInBounds(boid)];
  } else {
    vectors = [
      flyToCenterOfFlock(boid, otherBoids),
      maintainDistance(boid, otherBoids),
      matchVelocity(boid, otherBoids),
      // stayInBounds(boid),
    ];
  }

  vectors = [
    ...vectors,
    moveTowardsMouse(boid, state.p5.mouseX, state.p5.mouseY),
  ];
  // console.log("boid.id", boid.id, vectors);

  // Sum vectors
  return vectors.reduce(
    (prev: Vector, curr: Vector) => ({
      dx: prev.dx + curr.dx,
      dy: prev.dy + curr.dy,
    }),
    { dx: 0, dy: 0 }
  );
}

function velocityLimiter(v: Vector): Vector {
  return {
    dx: Math.max(Math.min(v.dx, 10), -10),
    dy: Math.max(Math.min(v.dy, 10), -10),
  };
}

export function updateState(state: State): State {
  return {
    ...state,
    boids: state.boids.map((boid) => {
      let v = newBoidVector(boid, state);

      v.dx += boid.v.dx;
      v.dy += boid.v.dy;

      v = velocityLimiter(v);

      let x = boid.x + v.dx;
      let y = boid.y + v.dy;

      if (x > X_DIM) x -= X_DIM;
      if (x < 0) x += X_DIM;
      if (y > Y_DIM) y -= Y_DIM;
      if (y < 0) y += Y_DIM;

      // console.log(v);
      return {
        ...boid,
        x, // : boid.x + v.dx,
        y, // : boid.y + v.dy,
        v,
      };
    }),
  };
}

export function draw(sketch: p5, state: State) {
  sketch.background(220);

  const red = sketch.color(255, 0, 0);
  const green = sketch.color(0, 255, 0);
  const white = sketch.color(255, 255, 255);

  const boid0 = state.boids[50];
  // console.log(boid0);
  for (const boid of state.boids) {
    sketch.fill(white);
    if (boid.id === 50) {
      sketch.fill(red);
    } else if (isNeighbor(boid0, boid)) {
      sketch.fill(green);
    }

    sketch.circle(boid.x, boid.y, DISTANCE_THRESHOLD / 2);
    sketch.line(boid.x, boid.y, boid.x + boid.v.dx * 5, boid.y + boid.v.dy * 5);
  }

  return state;
}
