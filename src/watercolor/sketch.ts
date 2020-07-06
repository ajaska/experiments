import p5 from "p5";

export interface State {
  p5: p5;
}

/* Polygon Deformation Technique
 * For each line in the polygon, find the midpoint. Add a new point from a Gaussian distribution centered on that point.
 */
const GAUSSIAN_SD = 0.4;
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
      variance -= 0.04;
    } else if (heading < -Math.PI / 2) {
      variance += 0.04;
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
const Y_DIM = window.innerHeight - 4;

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

interface LayoutInfo {
  points?: p5.Vector[];
  translateX?: number;
  translateY?: number;
  rotate?: number;
}

const SUBLAYER_COUNT = 5;
const LAYOUT: LayoutInfo[] = [
  {
    translateX: -100,
    translateY: -100,
    rotate: Math.PI / 2,
  },
  {
    translateX: 100,
    translateY: -100,
    rotate: -Math.PI / 2,
  },
  {
    translateX: -100,
    translateY: 100,
    rotate: Math.PI,
  },
  {
    translateX: 100,
    translateY: 100,
    rotate: 0,
  },
];

export function draw(sketch: p5, state: State) {
  // Move center to 0, 0
  sketch.translate(X_DIM / 2, Y_DIM / 2);
  sketch.background(250, 245, 235);

  sketch.noStroke();

  const colorScheme =
    COLOR_SCHEMES[Math.floor(sketch.random(COLOR_SCHEMES.length))];

  for (let i = 0; i < LAYER_COUNT; i += SUBLAYER_COUNT) {
    for (let c = 0; c < 4; c++) {
      const layoutInfo = LAYOUT[c];
      sketch.fill(colorScheme[c]);

      sketch.push();
      if (layoutInfo.translateX && layoutInfo.translateY) {
        sketch.translate(layoutInfo.translateX, layoutInfo.translateY);
      }
      if (layoutInfo.rotate) {
        sketch.rotate(layoutInfo.rotate);
      }

      const points = (layoutInfo.points =
        layoutInfo.points || generatePoints(sketch));

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
      }
      sketch.pop();
    }
  }

  return state;
}

const COLOR_SCHEMES = [
  [
    `rgba(139,  205, 205, ${LAYER_OPACITY})`,
    `rgba(229,  237, 183, ${LAYER_OPACITY})`,
    `rgba(250,  240, 175, ${LAYER_OPACITY})`,
    `rgba(241,  197, 197, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(212,  181, 176, ${LAYER_OPACITY})`,
    `rgba(238,  218, 209, ${LAYER_OPACITY})`,
    `rgba(246,  158, 123, ${LAYER_OPACITY})`,
    `rgba(56,  62, 86, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(227,  99, 135, ${LAYER_OPACITY})`,
    `rgba(242,  170, 170, ${LAYER_OPACITY})`,
    `rgba(166,  220, 239, ${LAYER_OPACITY})`,
    `rgba(221,  243, 245, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(246,  222, 246, ${LAYER_OPACITY})`,
    `rgba(229,  207, 229, ${LAYER_OPACITY})`,
    `rgba(207,  229, 207, ${LAYER_OPACITY})`,
    `rgba(207,  246, 207, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(244,  235, 193, ${LAYER_OPACITY})`,
    `rgba(160,  193, 184, ${LAYER_OPACITY})`,
    `rgba(112,  159, 176, ${LAYER_OPACITY})`,
    `rgba(114,  106, 149, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(170,  205, 190, ${LAYER_OPACITY})`,
    `rgba(244,  247, 197, ${LAYER_OPACITY})`,
    `rgba(251,  198, 135, ${LAYER_OPACITY})`,
    `rgba(234,  144, 122, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(171,  194, 232, ${LAYER_OPACITY})`,
    `rgba(219,  198, 235, ${LAYER_OPACITY})`,
    `rgba(209,  234, 163, ${LAYER_OPACITY})`,
    `rgba(239,  238, 157, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(103,  155, 155, ${LAYER_OPACITY})`,
    `rgba(170,  207, 207, ${LAYER_OPACITY})`,
    `rgba(210,  145, 188, ${LAYER_OPACITY})`,
    `rgba(255,  203, 203, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(245,  167, 167, ${LAYER_OPACITY})`,
    `rgba(249,  216, 156, ${LAYER_OPACITY})`,
    `rgba(130,  196, 195, ${LAYER_OPACITY})`,
    `rgba(188,  101, 141, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(225,  153, 153, ${LAYER_OPACITY})`,
    `rgba(245,  168, 168, ${LAYER_OPACITY})`,
    `rgba(250,  183, 183, ${LAYER_OPACITY})`,
    `rgba(221,  221, 221, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(250,  242, 242, ${LAYER_OPACITY})`,
    `rgba(243,  225, 225, ${LAYER_OPACITY})`,
    `rgba(241,  209, 209, ${LAYER_OPACITY})`,
    `rgba(125,  90, 90, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(104,  134, 197, ${LAYER_OPACITY})`,
    `rgba(255,  172, 183, ${LAYER_OPACITY})`,
    `rgba(255,  224, 172, ${LAYER_OPACITY})`,
    `rgba(249,  249, 249, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(255,  236, 199, ${LAYER_OPACITY})`,
    `rgba(253,  217, 152, ${LAYER_OPACITY})`,
    `rgba(245,  185, 113, ${LAYER_OPACITY})`,
    `rgba(133,  163, 146, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(216,  52, 95, ${LAYER_OPACITY})`,
    `rgba(229,  138, 138, ${LAYER_OPACITY})`,
    `rgba(204,  175, 175, ${LAYER_OPACITY})`,
    `rgba(88,  141, 168, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(103,  155, 155, ${LAYER_OPACITY})`,
    `rgba(170,  207, 207, ${LAYER_OPACITY})`,
    `rgba(253,  226, 226, ${LAYER_OPACITY})`,
    `rgba(255,  182, 182, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(255,  235, 153, ${LAYER_OPACITY})`,
    `rgba(164,  197, 198, ${LAYER_OPACITY})`,
    `rgba(212,  235, 208, ${LAYER_OPACITY})`,
    `rgba(133,  108, 139, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(241,  146, 146, ${LAYER_OPACITY})`,
    `rgba(203,  226, 176, ${LAYER_OPACITY})`,
    `rgba(252,  247, 187, ${LAYER_OPACITY})`,
    `rgba(246,  209, 134, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(243,  236, 184, ${LAYER_OPACITY})`,
    `rgba(245,  202, 179, ${LAYER_OPACITY})`,
    `rgba(168,  211, 218, ${LAYER_OPACITY})`,
    `rgba(181,  144, 202, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(66,  72, 116, ${LAYER_OPACITY})`,
    `rgba(166,  177, 225, ${LAYER_OPACITY})`,
    `rgba(220,  214, 247, ${LAYER_OPACITY})`,
    `rgba(244,  238, 255, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(255,  170, 165, ${LAYER_OPACITY})`,
    `rgba(255,  211, 182, ${LAYER_OPACITY})`,
    `rgba(220,  237, 193, ${LAYER_OPACITY})`,
    `rgba(168,  230, 207, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(233,  225, 204, ${LAYER_OPACITY})`,
    `rgba(234,  144, 133, ${LAYER_OPACITY})`,
    `rgba(212,  80, 121, ${LAYER_OPACITY})`,
    `rgba(110,  87, 115, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(246,  238, 199, ${LAYER_OPACITY})`,
    `rgba(255,  182, 185, ${LAYER_OPACITY})`,
    `rgba(244,  218, 218, ${LAYER_OPACITY})`,
    `rgba(190,  235, 233, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(48,  71, 94, ${LAYER_OPACITY})`,
    `rgba(186,  107, 87, ${LAYER_OPACITY})`,
    `rgba(241,  147, 92, ${LAYER_OPACITY})`,
    `rgba(231,  178, 165, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(108,  86, 123, ${LAYER_OPACITY})`,
    `rgba(192,  108, 132, ${LAYER_OPACITY})`,
    `rgba(246,  114, 128, ${LAYER_OPACITY})`,
    `rgba(248,  177, 149, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(129,  245, 255, ${LAYER_OPACITY})`,
    `rgba(160,  255, 230, ${LAYER_OPACITY})`,
    `rgba(255,  255, 221, ${LAYER_OPACITY})`,
    `rgba(255,  213, 229, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(254,  179, 119, ${LAYER_OPACITY})`,
    `rgba(247,  232, 240, ${LAYER_OPACITY})`,
    `rgba(241,  198, 222, ${LAYER_OPACITY})`,
    `rgba(234,  176, 217, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(194,  149, 216, ${LAYER_OPACITY})`,
    `rgba(228,  163, 212, ${LAYER_OPACITY})`,
    `rgba(241,  198, 211, ${LAYER_OPACITY})`,
    `rgba(252,  226, 219, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(106,  140, 175, ${LAYER_OPACITY})`,
    `rgba(117,  183, 158, ${LAYER_OPACITY})`,
    `rgba(167,  233, 175, ${LAYER_OPACITY})`,
    `rgba(238,  249, 191, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(185,  204, 237, ${LAYER_OPACITY})`,
    `rgba(246,  231, 230, ${LAYER_OPACITY})`,
    `rgba(251,  244, 249, ${LAYER_OPACITY})`,
    `rgba(246,  229, 245, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(233,  226, 208, ${LAYER_OPACITY})`,
    `rgba(234,  144, 133, ${LAYER_OPACITY})`,
    `rgba(212,  93, 121, ${LAYER_OPACITY})`,
    `rgba(110,  87, 115, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(248,  195, 175, ${LAYER_OPACITY})`,
    `rgba(254,  165, 173, ${LAYER_OPACITY})`,
    `rgba(234,  154, 187, ${LAYER_OPACITY})`,
    `rgba(190,  138, 191, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(138,  198, 209, ${LAYER_OPACITY})`,
    `rgba(187,  222, 214, ${LAYER_OPACITY})`,
    `rgba(250,  227, 217, ${LAYER_OPACITY})`,
    `rgba(255,  182, 185, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(241,  241, 246, ${LAYER_OPACITY})`,
    `rgba(225,  204, 236, ${LAYER_OPACITY})`,
    `rgba(201,  182, 228, ${LAYER_OPACITY})`,
    `rgba(190,  159, 225, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(201,  117, 61, ${LAYER_OPACITY})`,
    `rgba(235,  130, 66, ${LAYER_OPACITY})`,
    `rgba(230,  161, 87, ${LAYER_OPACITY})`,
    `rgba(157,  171, 134, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(245,  205, 170, ${LAYER_OPACITY})`,
    `rgba(207,  180, 149, ${LAYER_OPACITY})`,
    `rgba(117,  129, 132, ${LAYER_OPACITY})`,
    `rgba(93,  91, 106, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(50,  175, 169, ${LAYER_OPACITY})`,
    `rgba(164,  212, 174, ${LAYER_OPACITY})`,
    `rgba(231,  240, 195, ${LAYER_OPACITY})`,
    `rgba(240,  207, 133, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(229,  228, 204, ${LAYER_OPACITY})`,
    `rgba(186,  199, 167, ${LAYER_OPACITY})`,
    `rgba(136,  158, 129, ${LAYER_OPACITY})`,
    `rgba(105,  132, 116, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(108,  86, 123, ${LAYER_OPACITY})`,
    `rgba(192,  108, 132, ${LAYER_OPACITY})`,
    `rgba(246,  114, 128, ${LAYER_OPACITY})`,
    `rgba(248,  177, 149, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(214,  229, 250, ${LAYER_OPACITY})`,
    `rgba(254,  246, 251, ${LAYER_OPACITY})`,
    `rgba(230,  178, 198, ${LAYER_OPACITY})`,
    `rgba(215,  127, 161, ${LAYER_OPACITY})`,
  ],
  [
    `rgba(150,  86, 161, ${LAYER_OPACITY})`,
    `rgba(194,  176, 201, ${LAYER_OPACITY})`,
    `rgba(204,  204, 204, ${LAYER_OPACITY})`,
    `rgba(244,  239, 211, ${LAYER_OPACITY})`,
  ],
];
