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

enum GoalType {
  Point = 1,
  Velocity,
  Acceleration,
}

interface SeekPoint {
  type: GoalType.Point;
  goal: Point;
}

interface MatchVelocity {
  type: GoalType.Velocity;
  goal: Vector;
}

interface ApplyForce {
  type: GoalType.Acceleration;
  goal: Vector;
}

type Goal = SeekPoint | MatchVelocity | ApplyForce | null;

const FLOCK_THRESHOLD = 50;
const SEPARATION_THRESHOLD = 25;

const MAX_SPEED = 3;
const MAX_ACCEL = 0.05;
// 5 degrees
let MAX_TURN_SPEED = Math.PI / 36;

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
      v: new Vector(sketch.random(0, 1), sketch.random(0, 2 * Math.PI)),
    });
  }

  return { boids, p5: undefined } as any;
}

// Cohesion
// Return: a vector with your new desired velocity
function flyToCenterOfFlock(_boid: Boid, flock: Boid[]): Goal {
  const flockCenter = Point.averageOfPoints(flock.map((f) => f.p));
  return { type: GoalType.Point, goal: flockCenter };
}

// Separation
function maintainDistance(boid: Boid, flock: Boid[]): Goal {
  let vectors = [];

  for (const flockMate of flock) {
    // This is the direction away from the neighbor
    let direction = flockMate.p.toPoint(boid.p);

    const distance = direction.length();
    if (distance > 0 && distance < SEPARATION_THRESHOLD) {
      // The closer they are, the more we need to avoid them.
      direction = direction.unit().divide(distance);
      vectors.push(direction);
    }
  }

  // If no one else is around, keep on keeping on
  if (vectors.length === 0) return null;

  return {
    type: GoalType.Acceleration,
    goal: Vector.sumVectors(vectors)
      .divide(vectors.length)
      .unit()
      .multiply(MAX_ACCEL / 1.5),
  };
}

// Alignment
function matchVelocity(_boid: Boid, flock: Boid[]): Goal {
  const flockVelocity = Vector.sumVectors(flock.map((f) => f.v)).divide(
    flock.length
  );

  return { type: GoalType.Velocity, goal: flockVelocity };
}

const center = new Point(X_DIM / 2, Y_DIM / 2);
function stayInBounds(boid: Boid): Goal {
  const threshold = X_DIM / 4;
  const distance = center.distance(boid.p);
  if (distance > threshold) {
    const direction = boid.p.toPoint(center).unit();
    const maxForceAt = X_DIM * (3 / 8);
    const lerped = (distance - threshold) / (maxForceAt - threshold);
    const scaled = direction.multiply(lerped).multiply(MAX_ACCEL);

    return { type: GoalType.Acceleration, goal: scaled };
  }
  return null;
}

function forceInBounds(point: Point): Point | null {
  const direction = center.toPoint(point);
  if (direction.length() > X_DIM / 2) {
    return center.add(direction.limit(X_DIM / 2));
  }
  return null;
}

// Return: a vector with your new desired velocity
function moveTowardsMouse(mouse: Point, boid: Boid): Goal {
  if (mouse.x > 0 && mouse.x < X_DIM && mouse.y > 0 && mouse.y < Y_DIM) {
    const vector = boid.p.toPoint(mouse);
    if (vector.length() < X_DIM / 6) {
      return { type: GoalType.Point, goal: mouse };
    }
  }
  return null;
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

function normAngle(theta: number) {
  while (theta > Math.PI) theta -= Math.PI * 2;
  while (theta < -Math.PI) theta += Math.PI * 2;
  return theta;
}

function clamp(lower: number, value: number, upper: number) {
  if (value < lower) {
    return lower;
  }
  if (value > upper) {
    return upper;
  }
  return value;
}

// Compute change in vector
function computeSteer(boid: Boid, desired: Goal) {
  if (desired == null) {
    return new Vector(0, 0);
  }

  let acceleration: Vector;
  if (desired.type === GoalType.Point || desired.type === GoalType.Velocity) {
    let velocity: Vector;
    if (desired.type === GoalType.Point) {
      velocity = boid.p.toPoint(desired.goal);

      velocity = velocity.unit().multiply(MAX_SPEED);
    } else {
      velocity = desired.goal;

      velocity = velocity.limit(MAX_SPEED);
    }
    // Not sure which of these is better:
    // This one allows for some force scaling
    // velocity = velocity.limit(1).multiply(MAX_SPEED);
    // This one applies all forces maximally?
    // velocity = velocity.unit().multiply(MAX_SPEED);
    acceleration = Vector.sumVectors([velocity, boid.v.multiply(-1)]);
  } else {
    acceleration = desired.goal;
  }

  return acceleration.limit(MAX_ACCEL);
}

function newBoidVector(boid: Boid, state: State): Vector {
  const flock = state.boids
    .filter((someBoid) => boid.id !== someBoid.id)
    .filter((someBoid) => isNeighbor(boid, someBoid));

  let vectors: Vector[] = [
    computeSteer(boid, stayInBounds(boid)).multiply(2),

    // Use all boids; boids can sense behind them, for proximity
    computeSteer(boid, maintainDistance(boid, state.boids)).multiply(3),

    // Make boids go slightly faster when possible
    computeSteer(boid, {
      type: GoalType.Acceleration,
      goal: new Vector(MAX_ACCEL / 100, boid.v.theta),
    }),
  ];

  const mouse = new Point(state.p5.mouseX, state.p5.mouseY);
  if (mouse.x > 0 && mouse.x < X_DIM && mouse.y > 0 && mouse.y < Y_DIM) {
    vectors.push(
      computeSteer(boid, moveTowardsMouse(mouse, boid)).multiply(-2.4)
    );
  }

  if (flock.length > 0) {
    vectors = [
      ...vectors,
      computeSteer(boid, flyToCenterOfFlock(boid, flock)).multiply(0.8),
      computeSteer(boid, matchVelocity(boid, flock)),
    ];
  }

  // Sum vectors
  return Vector.sumVectors(vectors);
}

export function updateState(state: State): State {
  return {
    ...state,
    boids: state.boids.map((boid) => {
      const dv = newBoidVector(boid, state);
      // let v = boid.v.add(dv).limit(MAX_SPEED);

      let v = Vector.sumVectors([boid.v, dv]).limit(MAX_SPEED);

      // Limit max turn speed
      let dAngle = normAngle(v.angle() - boid.v.angle());
      if (dAngle > MAX_TURN_SPEED) {
        v.theta = normAngle(boid.v.angle() + MAX_TURN_SPEED);
      }
      if (dAngle < -MAX_TURN_SPEED) {
        v.theta = normAngle(boid.v.angle() - MAX_TURN_SPEED);
      }

      const p = boid.p.add(v);
      const p2 = forceInBounds(p);

      return {
        ...boid,
        p: p2 || p,
        v,
      };
    }),
  };
}

const scale = (-SEPARATION_THRESHOLD / 4) * 1.5;
function drawBoid(sketch: p5, boid: Boid) {
  const theta = boid.v.angle() - sketch.radians(90);

  {
    sketch.push();
    sketch.translate(boid.p.x, boid.p.y);
    sketch.rotate(theta);

    {
      sketch.beginShape();
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
