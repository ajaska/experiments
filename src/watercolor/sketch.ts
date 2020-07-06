import p5 from "p5";

export interface State {
  p5: p5;
  points: p5.Vector[];
}

/* Polygon Deformation Technique
 * For each line in the polygon, find the midpoint. Add a new point from a Gaussian distribution centered on that point.
 */
const GAUSSIAN_SD = 0.45;
function polygonDeformation(sketch: p5, points: p5.Vector[]): p5.Vector[] {
  let newPoints = [];
  for (let i = 0; i < points.length; i++) {
    // Pick our points, being sure to loop around correctly...
    const a = points[i];
    const c = i === points.length - 1 ? points[0] : points[i + 1];

    // The midpoint is a basic average of the two points
    const b = sketch.createVector((a.x + c.x) / 2, (a.y + c.y) / 2);

    const gaussianShift = sketch.randomGaussian(0, GAUSSIAN_SD);

    // Calculate a perpendicular vector
    let bPerp = sketch.createVector(-(c.y - a.y), c.x - a.x);
    const shiftedB = p5.Vector.add(b, bPerp.mult(gaussianShift));

    newPoints.push(a);
    newPoints.push(shiftedB);
  }

  return newPoints;
}

const X_DIM = window.innerWidth;
const Y_DIM = window.innerHeight;

const N_SIDES = 10;
const RADIUS = 200;
const BASE_DEFORMATIONS = 5;

export function setup(sketch: p5): State {
  let points: p5.Vector[] = [];
  for (let i = 0; i < N_SIDES; i++) {
    const angle = Math.PI * 2 * (i / N_SIDES);
    points.push(
      sketch.createVector(RADIUS * Math.cos(angle), RADIUS * Math.sin(angle))
    );
  }

  sketch.createCanvas(X_DIM, Y_DIM);
  sketch.noLoop();

  for (let i = 0; i < BASE_DEFORMATIONS; i++) {
    points = polygonDeformation(sketch, points);
  }

  return { points, p5: sketch };
}

export function updateState(state: State): State {
  return {
    ...state,
  };
}

const LAYER_COUNT = 45;
const LAYER_OPACITY = 0.04;
const LAYER_DEFORMATIONS = 6;

export function draw(sketch: p5, state: State) {
  // Move center to 0, 0
  sketch.translate(X_DIM / 2, Y_DIM / 2);
  sketch.background(223, 214, 189);

  sketch.noStroke();
  sketch.fill(`rgba(255, 0, 0, ${LAYER_OPACITY})`);

  for (let i = 0; i < LAYER_COUNT; i++) {
    let layerPoints = state.points;
    for (let j = 0; j < LAYER_DEFORMATIONS; j++) {
      layerPoints = polygonDeformation(sketch, layerPoints);
    }
    sketch.beginShape();
    for (const point of layerPoints) {
      sketch.vertex(point.x, point.y);
    }
    sketch.endShape(sketch.CLOSE);
  }

  return state;
}
