import p5 from "p5";

export interface State {
  frame: number;

  xSlider: p5.Element;
  ySlider: p5.Element;
  scaleSlider: p5.Element;
}

export function setup(sketch: p5): State {
  sketch.createCanvas(500, 500);

  // create sliders
  let xSlider = sketch.createSlider(-1000, 1000, -75);
  xSlider.position(20, 20);
  let ySlider = sketch.createSlider(-1000, 1000, -400);
  ySlider.position(20, 50);
  let scaleSlider = sketch.createSlider(0, 2, 1, 0.1);
  scaleSlider.position(20, 80);

  return {
    frame: 0,

    xSlider,
    ySlider,
    scaleSlider,
  };
}

export function draw(sketch: p5, state: State): State {
  sketch.background(220);
  const x = state.xSlider.value();
  const y = state.ySlider.value();
  const scale = state.scaleSlider.value();
  sketch.text(`x offset ${x}`, state.xSlider.x * 2 + state.xSlider.width, 35);
  sketch.text(`y offset ${y}`, state.ySlider.x * 2 + state.ySlider.width, 65);
  sketch.text(
    `scale ${scale}`,
    state.scaleSlider.x * 2 + state.scaleSlider.width,
    95
  );

  sketch.ellipse(200, sketch.height / 2, 20, 20);

  sketch.push();
  sketch.translate(Number(x), Number(y));
  sketch.scale(Number(scale));

  /**
   * Converted from SVG format using @darrylyeo's SVG-to-PJS converter:
   * darryl-yeo.com/svg-to-processing-js-converter
   */

  sketch.fill(0);
  sketch.noStroke();

  sketch.ellipse(0, 0, 20, 20);

  sketch.angleMode(sketch.DEGREES);

  // let xShear = 4;
  // console.log(xShear);
  sketch.push();
  let xShear = (Math.floor(state.frame / 10) % 20) - 10;
  sketch.shearX(sketch.PI / xShear);

  sketch.applyMatrix

  sketch.fill("red");
  sketch.beginShape();
  sketch.vertex(355.931, 880.214);
  sketch.bezierVertex(355.931, 892.224, 348.276, 901.953, 338.843, 901.953);
  sketch.vertex(338.843, 901.953);
  sketch.bezierVertex(329.378, 901.953, 321.736, 892.224, 321.736, 880.214);
  sketch.vertex(321.736, 732.412);
  sketch.bezierVertex(321.736, 720.395, 329.378, 710.64, 338.843, 710.64);
  sketch.vertex(338.843, 710.64);
  sketch.bezierVertex(348.27, 710.64, 355.931, 720.395, 355.931, 732.412);
  sketch.vertex(355.931, 880.214);
  sketch.endShape();
  sketch.pop();

  sketch.fill("orange");
  sketch.beginShape();
  sketch.vertex(355.931, 754.119);
  sketch.bezierVertex(355.931, 754.119, 344.488, 783.126, 321.736, 777.785);
  sketch.vertex(321.846, 738.326);
  sketch.vertex(347.284, 738.326);
  sketch.vertex(355.628, 741.226);
  sketch.vertex(355.931, 754.112);
  sketch.endShape();

  sketch.fill("yellow");
  sketch.beginShape();
  sketch.vertex(348.695, 842.572);
  sketch.bezierVertex(349.932, 843.422, 375.325, 862.172, 440.453, 800.549);
  sketch.bezierVertex(499.255, 744.924, 476.007, 778.139, 503.456, 764.518);
  sketch.bezierVertex(503.456, 764.518, 504.989, 760.685, 494.023, 754.235);
  sketch.bezierVertex(494.023, 754.235, 437.509, 733.662, 348.689, 805.691);
  sketch.endShape();

  sketch.fill("green");
  sketch.beginShape();
  sketch.vertex(328.953, 842.572);
  sketch.bezierVertex(327.729, 843.422, 302.342, 862.172, 237.181, 800.549);
  sketch.bezierVertex(178.393, 744.924, 201.666, 778.139, 174.218, 764.518);
  sketch.bezierVertex(174.218, 764.518, 172.652, 760.685, 183.631, 754.235);
  sketch.bezierVertex(183.631, 754.235, 240.158, 733.662, 328.953, 805.691);
  sketch.endShape();

  sketch.fill("blue");
  sketch.beginShape();
  sketch.vertex(253.141, 800.575);
  sketch.bezierVertex(194.327, 744.937, 217.594, 778.165, 190.126, 764.544);
  sketch.bezierVertex(190.126, 764.544, 188.593, 760.71, 199.559, 754.241);
  sketch.bezierVertex(199.559, 754.241, 204.243, 752.553, 213, 751.857);
  sketch.bezierVertex(194.076, 750.472, 183.625, 754.241, 183.625, 754.241);
  sketch.bezierVertex(172.646, 760.685, 174.211, 764.544, 174.211, 764.544);
  sketch.bezierVertex(201.66, 778.165, 178.387, 744.937, 237.207, 800.575);
  sketch.bezierVertex(286.034, 846.754, 312.51, 847.81, 323.251, 845.053);
  sketch.bezierVertex(308.618, 842.218, 285.912, 831.567, 253.141, 800.575);
  sketch.endShape();

  sketch.fill("purple");
  sketch.beginShape();
  sketch.vertex(270.467, 504.539);
  sketch.bezierVertex(266.505, 502.181, 261.692, 502.078, 257.8, 504.662);
  sketch.bezierVertex(256.595, 505.454, 255.384, 506.253, 254.192, 507.046);
  sketch.bezierVertex(249.578, 508.012, 245.944, 511.259, 247.465, 516.556);
  sketch.bezierVertex(261.898, 566.71, 232.987, 614.171, 239.926, 664.532);
  sketch.bezierVertex(245.571, 705.562, 291.859, 736.973, 334.249, 746.361);
  sketch.bezierVertex(341.536, 747.972, 345.37, 742.946, 345.196, 737.721);
  sketch.bezierVertex(386.504, 673.862, 335.396, 543.07, 270.467, 504.539);
  sketch.endShape();

  sketch.fill("pink");
  sketch.beginShape();
  sketch.vertex(321.769, 493.863);
  sketch.bezierVertex(318.012, 491.266, 313.212, 490.854, 309.12, 493.186);
  sketch.bezierVertex(307.858, 493.901, 306.588, 494.616, 305.332, 495.332);
  sketch.bezierVertex(300.648, 496.008, 296.756, 499.017, 297.851, 504.384);
  sketch.bezierVertex(308.18, 555.325, 275.499, 600.872, 278.328, 651.516);
  sketch.bezierVertex(280.628, 692.792, 296.311, 718.939, 337.812, 730.975);
  sketch.bezierVertex(344.945, 733.043, 361.44, 739.164, 361.697, 733.945);
  sketch.bezierVertex(408.083, 672.856, 383.398, 536.388, 321.756, 493.869);
  sketch.endShape();

  sketch.fill("white");
  sketch.beginShape();
  sketch.vertex(390.718, 513.701);
  sketch.bezierVertex(394.681, 511.343, 399.494, 511.234, 403.385, 513.817);
  sketch.bezierVertex(404.597, 514.616, 405.802, 515.409, 407, 516.208);
  sketch.bezierVertex(411.613, 517.168, 415.247, 520.415, 413.733, 525.705);
  sketch.bezierVertex(399.3, 575.86, 428.205, 623.385, 421.272, 673.681);
  sketch.bezierVertex(415.628, 714.712, 369.339, 746.123, 326.949, 755.504);
  sketch.bezierVertex(319.662, 757.121, 315.828, 752.096, 316.002, 746.87);
  sketch.bezierVertex(274.681, 683.011, 325.789, 552.219, 390.718, 513.689);
  sketch.endShape();

  sketch.pop();

  /**
   * Converted from SVG format using @darrylyeo's SVG-to-PJS converter:
   * darryl-yeo.com/svg-to-processing-js-converter
   */

  // sketch.noLoop();

  return state;
}
