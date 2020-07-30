import p5 from "p5";

declare var process: any;
if (process.env.NODE_ENV === "production") {
  // @ts-ignore
  p5.disableFriendlyErrors = true;
}

declare var require: any;
const imageFile: string = require("url:./screenshot.png");

export interface State {
  p5: p5;
  img?: p5.Image;
  i: number;
}

export function setup(sketch: p5): State {
  sketch.createCanvas(1200, 800);
  sketch.background(64, 64, 64);
  const state: State = { p5: sketch, i: 0 };

  sketch.loadImage(imageFile, (img) => {
    state.img = img;
  });

  return state;
}

function mortonDistance(x: number, y: number, z: number): number {
  x = (x | (x << 16)) & 0x030000ff;
  x = (x | (x << 8)) & 0x0300f00f;
  x = (x | (x << 4)) & 0x030c30c3;
  x = (x | (x << 2)) & 0x09249249;

  y = (y | (y << 16)) & 0x030000ff;
  y = (y | (y << 8)) & 0x0300f00f;
  y = (y | (y << 4)) & 0x030c30c3;
  y = (y | (y << 2)) & 0x09249249;

  z = (z | (z << 16)) & 0x030000ff;
  z = (z | (z << 8)) & 0x0300f00f;
  z = (z | (z << 4)) & 0x030c30c3;
  z = (z | (z << 2)) & 0x09249249;

  return x | (y << 1) | (z << 2);
}

export function updateState(state: State): void {
  const { img, p5 } = state;
  if (img == null) return;
  img.loadPixels();

  if (state.i === 1) {
    console.log(img.pixels);

    console.log("start");
    const start = performance.now();
    const indices = new Uint32Array(img.width * img.height);
    const distances = new Uint32Array(img.width * img.height);
    console.log("allocated", performance.now() - start);
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
            const h = p5.map(p5.hue(rgb), 0, 360, 0, 255, true) | 0;
            const s = p5.map(p5.saturation(rgb), 0, 100, 0, 255, true) | 0;
            const l = p5.map(p5.lightness(rgb), 0, 100, 0, 255, true) | 0;

            cache[cacheKey] = distances[index] = mortonDistance(l, s, h);
          }
          indices[index] = index;
        }
      }
    }
    console.log("calculated", performance.now() - start);
    const pixelCopy = Uint8Array.from(img.pixels);
    console.log("copied", performance.now() - start);
    indices.sort((indexA, indexB) => distances[indexA] - distances[indexB]);
    console.log("wow sorted", performance.now() - start);

    for (let index = 0; index < indices.length; index++) {
      const pixelsIndex = index * 4;

      const copyIndex = indices[index];
      const pixelCopyIndex = copyIndex * 4;

      img.pixels[pixelsIndex] = pixelCopy[pixelCopyIndex];
      img.pixels[pixelsIndex + 1] = pixelCopy[pixelCopyIndex + 1];
      img.pixels[pixelsIndex + 2] = pixelCopy[pixelCopyIndex + 2];
      img.pixels[pixelsIndex + 3] = pixelCopy[pixelCopyIndex + 3];
    }
    console.log("set", performance.now());
  }
  state.i++;

  img.updatePixels();
}

export function draw(sketch: p5, state: State) {
  if (state.img == null) return;
  sketch.image(state.img, 0, 0);
}
