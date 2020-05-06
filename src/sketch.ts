import p5 from "p5";

import { Vector, Point } from "./Vector";

interface Boid {
  id: number;

  p: Point;
  v: Vector;
}

export interface State {
  boids: Boid[];

  p5: p5;
}

const FLOCK_THRESHOLD = 50;
const SEPARATION_THRESHOLD = 25;

const MAX_SPEED = 3;
const MAX_ACCEL = 0.05;

const X_DIM = 800;
const Y_DIM = 800;
const FRAME_RATE = 60;

export function setup(sketch: p5): State {
  const RANDOM_SEED = 3;
  const NUM_BOIDS = 200;

  sketch.createCanvas(X_DIM, Y_DIM);
  sketch.frameRate(FRAME_RATE);

  sketch.randomSeed(RANDOM_SEED);
  const boids: Boid[] = [];
  // Old-school for-loop wow
  for (let i = 0; i < NUM_BOIDS; i++) {
    boids.push({
      id: i,
      p: new Point(sketch.random(0, X_DIM), sketch.random(0, Y_DIM)),
      v: Vector.fromAngles(0, sketch.random(0, 2 * Math.PI)).multiply(
        sketch.random(0, MAX_SPEED)
      ),
    });
  }

  return { boids, p5: undefined } as any;
}

// Cohesion
// Return: a vector with your new desired velocity
function flyToCenterOfFlock(boid: Boid, flock: Boid[]): Vector {
  const flockCenter = Point.averageOfPoints(flock.map((f) => f.p));

  // Compute vector to direction
  const vector = boid.p.toPoint(flockCenter);

  return vector.unit();
}

// Separation
// Return: a vector with your new desired velocity
function maintainDistance(boid: Boid, flock: Boid[]): Vector {
  let weightedNeighborVector = new Vector(0, 0);

  for (const flockMate of flock) {
    // This is the direction away from the neighbor
    let direction = flockMate.p.toPoint(boid.p);

    const distance = direction.length();
    if (distance > 0 && distance < SEPARATION_THRESHOLD) {
      // The closer they are, the more we need to avoid them.
      direction = direction.unit().divide(distance);
      weightedNeighborVector = weightedNeighborVector.add(direction);
    }
  }

  if (weightedNeighborVector.length() > 0) return weightedNeighborVector.unit();
  // If no one else is around, keep on keeping on
  else return boid.v;
}

// Alignment
// Return: a vector with your new desired velocity
function matchVelocity(_boid: Boid, flock: Boid[]): Vector {
  const flockVelocity = Vector.averageOfVectors(flock.map((f) => f.v));

  return flockVelocity.unit();
}

// Return: a vector with your new desired velocity
function stayInBounds(boid: Boid): Vector {
  const center = new Point(X_DIM / 2, Y_DIM / 2);

  const threshold = X_DIM / 4;
  const distance = center.distance(boid.p);
  if (distance > threshold) {
    const direction = boid.p.toPoint(center).unit();
    const maxForceAt = X_DIM / 3;
    const lerped = (distance - threshold) / (maxForceAt - threshold);
    // const lerped = 1; //(distance - threshold) / (maxForceAt - threshold);
    const scaled = direction.multiply(lerped);

    // // Since we're building a force, we need to just add it to our velocity
    return scaled.add(boid.v);
    // return scaled;
  }
  // Since we're building a force, we need to just return our velocity
  return boid.v;
}

// Return: a vector with your new desired velocity
function moveTowardsMouse(mouse: Point, boid: Boid): Vector {
  if (mouse.x > 0 && mouse.x < X_DIM && mouse.y > 0 && mouse.y < Y_DIM) {
    return boid.p.toPoint(mouse);
  }
  return boid.v; // new Vector(0, 0);
}

const MAX_ANGLE_DIFF = (Math.PI * 3) / 4;
const PI_2 = 2 * Math.PI;
function isNeighbor(boid: Boid, otherBoid: Boid): boolean {
  const vector = boid.p.toPoint(otherBoid.p);
  if (vector.length() > FLOCK_THRESHOLD) return false;

  // Normalized angle diff (in radians)
  let angleDiff = vector.angle() - boid.v.angle();
  if (angleDiff > Math.PI) angleDiff -= PI_2;
  if (angleDiff < -Math.PI) angleDiff += PI_2;

  return Math.abs(angleDiff) < MAX_ANGLE_DIFF;
}

function computeSteer(boid: Boid, desired: Vector) {
  if (desired.length() === 0) {
    return new Vector(0, 0);
  }

  // Compute max velocity in desired direction
  // let nVector = vector.length() > 1 ? vector.unit() : vector;
  // let normalizedDesire = desired.unit().multiply(MAX_SPEED);
  let normalizedDesire = desired.limit(1).multiply(MAX_SPEED);

  // Compute difference
  let steer = normalizedDesire.subtract(boid.v);

  // Limit how fast we can change our velocity (inertia?)
  steer = steer.limit(MAX_ACCEL);

  return steer;
}

function newBoidVector(boid: Boid, state: State): Vector {
  const flock = state.boids
    .filter((someBoid) => boid.id !== someBoid.id)
    .filter((someBoid) => isNeighbor(boid, someBoid));

  let vectors: Vector[] = [
    computeSteer(boid, stayInBounds(boid)).multiply(2),

    // Use all boids; boids can sense behind them, for proximity
    computeSteer(boid, maintainDistance(boid, state.boids)).multiply(3),
  ];

  const mouse = new Point(state.p5.mouseX, state.p5.mouseY);
  if (mouse.x > 0 && mouse.x < X_DIM && mouse.y > 0 && mouse.y < Y_DIM) {
    vectors.push(
      computeSteer(boid, moveTowardsMouse(mouse, boid).multiply(-1.5))
    );
  }

  if (flock.length > 0) {
    vectors = [
      ...vectors,
      computeSteer(boid, flyToCenterOfFlock(boid, flock)),
      computeSteer(boid, matchVelocity(boid, flock)),
    ];
  }

  // Sum vectors
  return vectors.reduce((prev: Vector, curr: Vector) => {
    return prev.add(curr);
  }, new Vector(0, 0));
}

export function updateState(state: State): State {
  return {
    ...state,
    boids: state.boids.map((boid) => {
      const dv = newBoidVector(boid, state);
      const v = boid.v.add(dv).limit(MAX_SPEED);
      const p = boid.p.add(v);

      return {
        ...boid,
        p,
        v,
      };
    }),
  };
}

function drawBoid(sketch: p5, boid: Boid) {
  const theta = boid.v.angle() - sketch.radians(90);

  {
    sketch.push();
    sketch.translate(boid.p.x, boid.p.y);
    sketch.rotate(theta);

    {
      sketch.beginShape();
      const scale = -SEPARATION_THRESHOLD / 4;
      // Top
      sketch.vertex(0, -scale);
      // Left
      sketch.vertex(-scale / 2, scale);
      // Right
      sketch.vertex(scale / 2, scale);
      sketch.endShape(sketch.CLOSE);
    }
    sketch.pop();
  }
}

export function draw(sketch: p5, state: State) {
  sketch.background(255);
  sketch.fill(220);
  sketch.circle(X_DIM / 2, Y_DIM / 2, Math.max(X_DIM, Y_DIM));

  sketch.fill(255, 0, 0);
  sketch.circle(sketch.mouseX, sketch.mouseY, 4);

  const color = sketch.color(
    `hsb(${(3 * sketch.frameCount) % 360}, 100%, ${Math.floor(
      100
      // (speed / MAX_SPEED) * 100
    )}%)`
  );
  sketch.fill(color);
  sketch.stroke(64);

  for (const boid of state.boids) {
    drawBoid(sketch, boid);
  }

  return state;
}
