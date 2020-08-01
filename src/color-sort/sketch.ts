import p5 from "p5";

declare var process: any;
if (process.env.NODE_ENV === "production") {
  // @ts-ignore
  p5.disableFriendlyErrors = true;
}

// declare var require: any;
// const imageFile: string = require("url:./screenshot.png");

enum SortMethod {
  Random = 1,
  RGB,
  RGBMorton,
  HSL,
  HLS,
  HSLMorton,
  HLSMorton,
  HSB,
  HBS,
  HSBMorton,
  HBSMorton,
}

export interface State {
  p5: p5;
  img?: p5.Image;
  sel: p5.Element;
  sorted: boolean;
  method: SortMethod;
}

const X_DIM = window.innerWidth;
const Y_DIM = window.innerHeight - 4;

export function setup(sketch: p5): State {
  sketch.createCanvas(X_DIM, Y_DIM);
  sketch.background(64, 64, 64);

  const image = sketch.createImage(X_DIM, Y_DIM);
  image.loadPixels();

  for (let y = 0; y < image.height; y++) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    for (let x = 0; x < image.width; x++) {
      const index = (x + y * image.width) * 4;
      image.pixels[index] = r;
      image.pixels[index + 1] = g;
      image.pixels[index + 2] = b;
      image.pixels[index + 3] = 255;
    }
  }
  image.updatePixels();

  const sel = sketch.createSelect() as any;
  sel.position(10, 10);

  const names: { [name: string]: SortMethod } = {
    Random: SortMethod.Random,
    RGB: SortMethod.RGB,
    HSL: SortMethod.HSL,
    "HSL (HLS)": SortMethod.HLS,
    HSB: SortMethod.HSB,
    "HSB (HBS)": SortMethod.HBS,
    "RGB (Morton)": SortMethod.RGBMorton,
    "HSL (Morton)": SortMethod.HSLMorton,
    "HSL (HLS) (Morton)": SortMethod.HLSMorton,
    "HSB (Morton)": SortMethod.HSBMorton,
    "HSB (HBS) (Morton)": SortMethod.HBSMorton,
  };

  for (let name of Object.keys(names)) {
    sel.option(name);
  }

  // sketch.loadImage(imageFile, (img) => {
  //   state.img = img;
  // });

  const state = {
    p5: sketch,
    img: image,
    sel,
    sorted: false,
    method: SortMethod.Random,
  };

  sel.changed(() => {
    const value = sel.value();
    state.sorted = false;
    state.method = names[value];
    sketch.redraw();
  });

  return state;
}

function mortonDistance(x: number, y: number, z: number): number {
  // Assume x is a 10-bit (or less) number (0-1023)
  // .... .... ..98 7654 3210

  x = (x | (x << 16)) & 0x030000ff;
  //    ..98 7654 3210 .... ..98 7654 3210
  // &  0011 0000 0000 0000 0000 1111 1111
  // -> ..98 .... .... .... .... 7654 3210

  x = (x | (x << 8)) & 0x0300f00f;
  //    ..98 .... .... 7654 3210 7654 3210
  // &  0011 0000 0000 1111 0000 0000 1111
  // -> ..98 .... .... 7654 .... .... 3210

  x = (x | (x << 4)) & 0x030c30c3;
  //    ..98 .... 7654 7654 .... 3210 3210
  // &  0011 0000 1100 0011 0000 1100 0011
  // -> ..98 .... 76.. ..54 .... 32.. ..10

  x = (x | (x << 2)) & 0x09249249;
  //    9898 ..76 76.. 5454 ..32 32.. 1010
  // &  1001 0010 0100 1001 0010 0100 1001
  // -> 9..8 ..7. .6.. 5..4 ..3. .2.. 1..0

  y = (y | (y << 16)) & 0x030000ff;
  y = (y | (y << 8)) & 0x0300f00f;
  y = (y | (y << 4)) & 0x030c30c3;
  y = (y | (y << 2)) & 0x09249249;

  z = (z | (z << 16)) & 0x030000ff;
  z = (z | (z << 8)) & 0x0300f00f;
  z = (z | (z << 4)) & 0x030c30c3;
  z = (z | (z << 2)) & 0x09249249;

  // ..ZY XZYX ZYXZ YXZY XZYX ZYXZ YXZY XZYX
  return x | (y << 1) | (z << 2);
}

export function updateState(state: State): void {
  const { img, p5 } = state;
  if (img == null) return;

  if (!state.sorted) {
    img.loadPixels();
    console.debug(img.pixels);

    console.debug("start");
    const start = performance.now();
    const indices = new Uint32Array(img.width * img.height);
    const distances = new Uint32Array(img.width * img.height);
    console.debug("allocated", performance.now() - start);
    {
      const cache: { [cacheKey: number]: number } = {};
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = x + y * img.width;
          const pixelsIndex = index * 4;

          const rgb = [
            img.pixels[pixelsIndex],
            img.pixels[pixelsIndex + 1],
            img.pixels[pixelsIndex + 2],
          ];

          const cacheKey = (rgb[0] << 16) | (rgb[1] << 8) | (rgb[2] << 0);
          if (cacheKey in cache) {
            distances[index] = cache[cacheKey];
          } else {
            let distance: number;
            switch (state.method) {
              case SortMethod.Random: {
                distance = Math.floor(Math.random() * 999999999);
                break;
              }
              case SortMethod.RGB: {
                distance = (rgb[0] << 16) | (rgb[1] << 8) | (rgb[2] << 0);
                break;
              }
              case SortMethod.HSL:
              case SortMethod.HLS: {
                const h = p5.map(p5.hue(rgb), 0, 360, 0, 255, true) | 0;
                const s = p5.map(p5.saturation(rgb), 0, 100, 0, 255, true) | 0;
                const l = p5.map(p5.lightness(rgb), 0, 100, 0, 255, true) | 0;
                if (state.method === SortMethod.HSL) {
                  distance = (h << 16) | (s << 8) | (l << 0);
                } else {
                  distance = (h << 16) | (l << 8) | (s << 0);
                }
                break;
              }
              case SortMethod.HBS:
              case SortMethod.HSB: {
                p5.colorMode(p5.HSB);
                const h = p5.map(p5.hue(rgb), 0, 360, 0, 255, true) | 0;
                const s = p5.map(p5.saturation(rgb), 0, 100, 0, 255, true) | 0;
                const b = p5.map(p5.brightness(rgb), 0, 100, 0, 255, true) | 0;
                distance = (h << 16) | (s << 8) | (b << 0);
                if (state.method === SortMethod.HSB) {
                  distance = (h << 16) | (s << 8) | (b << 0);
                } else {
                  distance = (h << 16) | (b << 8) | (s << 0);
                }
                p5.colorMode(p5.RGB);
                break;
              }
              case SortMethod.RGBMorton: {
                distance = mortonDistance(rgb[2], rgb[1], rgb[0]);
                break;
              }
              case SortMethod.HSLMorton:
              case SortMethod.HLSMorton: {
                const h = p5.map(p5.hue(rgb), 0, 360, 0, 255, true) | 0;
                const s = p5.map(p5.saturation(rgb), 0, 100, 0, 255, true) | 0;
                const l = p5.map(p5.lightness(rgb), 0, 100, 0, 255, true) | 0;
                if (state.method === SortMethod.HSLMorton) {
                  distance = mortonDistance(l, s, h);
                } else {
                  distance = mortonDistance(s, l, h);
                }

                break;
              }
              case SortMethod.HBSMorton:
              case SortMethod.HSBMorton: {
                p5.colorMode(p5.HSB);
                const h = p5.map(p5.hue(rgb), 0, 360, 0, 255, true) | 0;
                const s = p5.map(p5.saturation(rgb), 0, 100, 0, 255, true) | 0;
                const b = p5.map(p5.brightness(rgb), 0, 100, 0, 255, true) | 0;
                if (state.method === SortMethod.HSBMorton) {
                  distance = mortonDistance(b, s, h);
                } else {
                  distance = mortonDistance(s, b, h);
                }
                p5.colorMode(p5.RGB);
                break;
              }
            }

            cache[cacheKey] = distances[index] = distance;
          }
          indices[index] = index;
        }
      }
    }
    console.debug("calculated", performance.now() - start);
    const pixelCopy = Uint8Array.from(img.pixels);
    console.debug("copied", performance.now() - start);
    indices.sort((indexA, indexB) => distances[indexA] - distances[indexB]);
    console.debug("wow sorted", performance.now() - start);

    for (let index = 0; index < indices.length; index++) {
      const copyIndex = indices[index];
      const pixelsIndex = index * 4;
      const pixelCopyIndex = copyIndex * 4;

      img.pixels[pixelsIndex] = pixelCopy[pixelCopyIndex];
      img.pixels[pixelsIndex + 1] = pixelCopy[pixelCopyIndex + 1];
      img.pixels[pixelsIndex + 2] = pixelCopy[pixelCopyIndex + 2];
      img.pixels[pixelsIndex + 3] = pixelCopy[pixelCopyIndex + 3];
    }
    console.debug("set", performance.now() - start);
    img.updatePixels();
    state.sorted = true;
  }
}

export function draw(sketch: p5, state: State) {
  if (state.img == null) return;
  sketch.image(state.img, 0, 0);
  if (state.method === SortMethod.Random) {
    sketch.fill("white");
    sketch.stroke("black");
    sketch.strokeWeight(8);
    sketch.textSize(24);
    sketch.text(
      `Colors are a three-dimensional space.
What does it mean to "sort" them, into a one-dimensional list?
Here's a comparison of sorting in several different color spaces.`,
      10,
      80
    );
  }
  sketch.noLoop();
}
