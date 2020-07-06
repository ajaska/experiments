import p5 from "p5";

export interface State {
  p5: p5;
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
    const heading = b.heading();

    // Dynamic variance based on heading
    let variance = GAUSSIAN_SD;
    if (heading > -Math.PI / 4 && heading < Math.PI / 2) {
      variance += 0.08;
    } else if (heading > (3 * Math.PI) / 4) {
      variance -= 0.05;
    } else if (heading < -Math.PI / 2) {
      variance += 0.02;
    }

    const gaussianShift = sketch.randomGaussian(0, variance);

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

function generatePoints(sketch: p5) {
  let points: p5.Vector[] = [];
  for (let i = 0; i < N_SIDES; i++) {
    const angle = Math.PI * 2 * (i / N_SIDES);
    points.push(
      sketch.createVector(RADIUS * Math.cos(angle), RADIUS * Math.sin(angle))
    );
  }
  for (let i = 0; i < BASE_DEFORMATIONS; i++) {
    points = polygonDeformation(sketch, points);
  }
  return points;
}

export function setup(sketch: p5): State {
  sketch.createCanvas(X_DIM, Y_DIM);
  sketch.noLoop();

  return { p5: sketch };
}

export function updateState(state: State): State {
  return {
    ...state,
  };
}

const LAYER_COUNT = 45;
const LAYER_OPACITY = 0.04;
const LAYER_DEFORMATIONS = 6;

interface Color {
  color: string;
  points?: p5.Vector[];
  translateX?: number;
  translateY?: number;
  rotate?: number;
}

const SUBLAYER_COUNT = 5;
const COLORS: Color[] = [
  {
    color: `rgba(255, 186, 186, ${LAYER_OPACITY})`,
    translateX: -100,
    translateY: -100,
    rotate: Math.PI / 2,
  },
  {
    color: `rgba(253, 226, 226, ${LAYER_OPACITY})`,
    translateX: 100,
    translateY: -100,
    rotate: -Math.PI / 2,
  },
  {
    color: `rgba(170, 207, 207, ${LAYER_OPACITY})`,
    translateX: -100,
    translateY: 100,
    rotate: Math.PI,
  },
  {
    color: `rgba(103, 155, 155, ${LAYER_OPACITY})`,
    translateX: 100,
    translateY: 100,
    rotate: 0,
  },
];

export function draw(sketch: p5, state: State) {
  // Move center to 0, 0
  sketch.translate(X_DIM / 2, Y_DIM / 2);
  sketch.background(223, 214, 189);

  sketch.noStroke();

  for (let i = 0; i < LAYER_COUNT; i += SUBLAYER_COUNT) {
    for (const colorInfo of COLORS) {
      const points = (colorInfo.points =
        colorInfo.points || generatePoints(sketch));

      sketch.fill(colorInfo.color);

      sketch.push();
      if (colorInfo.translateX && colorInfo.translateY) {
        sketch.translate(colorInfo.translateX, colorInfo.translateY);
      }
      if (colorInfo.rotate) {
        sketch.rotate(colorInfo.rotate);
      }

      for (let s = 0; s < SUBLAYER_COUNT; s++) {
        let sublayerPoints = points;
        for (let j = 0; j < LAYER_DEFORMATIONS; j++) {
          sublayerPoints = polygonDeformation(sketch, points);
        }
        sketch.beginShape();
        for (const point of sublayerPoints) {
          sketch.vertex(point.x, point.y);
        }
        sketch.endShape(sketch.CLOSE);

        console.log(i, colorInfo, s);
      }
      sketch.pop();
    }
  }

  return state;
}
