import p5 from "p5";

export interface State {
  p5: p5;
  grid: number[][];
}

const X_DIM = window.innerWidth;
const Y_DIM = window.innerHeight - 4;

const X_WIDTH = X_DIM * 2;
const Y_HEIGHT = Y_DIM * 2;
const DENSITY = 3;
const STEP_LENGTH = 10;
const NUM_STEPS = 5;

function nByMArray<T>(n: number, m: number, fillWith: T) {
  const rows = Array<T[]>(n).fill([]);
  return rows.map((_row) => Array<T>(m).fill(fillWith));
}

export function setup(sketch: p5): State {
  sketch.createCanvas(X_DIM, Y_DIM);

  const grid = nByMArray(
    Math.floor(Y_HEIGHT / DENSITY),
    Math.floor(X_WIDTH / DENSITY),
    0
  );

  const MODE: string = "RANDOM";

  for (let grid_y = 0; grid_y < grid.length; grid_y++) {
    for (let grid_x = 0; grid_x < grid[grid_y].length; grid_x++) {
      if (MODE === "CURVE") {
        const angle = (grid_y / grid.length) * Math.PI;
        grid[grid_y][grid_x] = angle;
      } else if (MODE === "PERLIN") {
        // Perlin noise
        // As a general rule the smaller the difference between coordinates, the
        // smoother the resulting noise sequence will be. Steps of 0.005-0.03
        // work best for most applications, but this will differ depending on use.
        const scaled_x = grid_x * 0.01;
        const scaled_y = grid_y * 0.01;
        const noise_val = sketch.noise(scaled_x, scaled_y);
        const angle = sketch.map(noise_val, 0, 1, 0, 2 * Math.PI);
        grid[grid_y][grid_x] = angle;
      } else if (MODE === "RANDOM") {
        const angle = sketch.map(Math.random(), 0, 1, 0, 2 * Math.PI);
        grid[grid_y][grid_x] = angle;
      }
    }
  }

  return { p5: sketch, grid };
}

export function updateState(state: State): void {
  const sketch = state.p5;
  const { movedY, movedX } = (sketch as any) as {
    movedX: number;
    movedY: number;
  };

  if (!sketch.mouseIsPressed) return;
  if (movedX || movedY) {
    const angle = Math.atan2(movedY, movedX);

    const grid_x0 = Math.floor((sketch.pmouseX + X_DIM / 2) / DENSITY);
    const grid_y0 = Math.floor((sketch.pmouseY + Y_DIM / 2) / DENSITY);

    const grid_x1 = Math.floor((sketch.mouseX + X_DIM / 2) / DENSITY);
    const grid_y1 = Math.floor((sketch.mouseY + Y_DIM / 2) / DENSITY);

    // https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
    function line(x0: number, y0: number, x1: number, y1: number) {
      let dx = Math.abs(x1 - x0);
      let dy = Math.abs(y1 - y0);
      let sx = x0 < x1 ? 1 : -1;
      let sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        if (0 <= y0 && y0 < state.grid.length) {
          if (0 <= x0 && x0 < state.grid[y0].length) {
            state.grid[y0][x0] = angle;
          }
        }

        if (x0 === x1 && y0 === y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    }

    line(grid_x0, grid_y0, grid_x1, grid_y1);
  }
}

export function draw(sketch: p5, state: State) {
  const { grid } = state;

  sketch.noLoop();

  const { movedY, movedX } = (sketch as any) as {
    movedX: number;
    movedY: number;
  };

  // Don't re-render unnecessarily
  if (
    sketch.frameCount > 1 &&
    movedX === 0 &&
    movedY === 0 &&
    sketch.mouseIsPressed
  )
    return;
  sketch.background(250, 245, 235);

  // for (let grid_y = 0; grid_y < grid.length; grid_y++) {
  //   for (let grid_x = 0; grid_x < grid[grid_y].length; grid_x++) {
  //     const canvas_x = Math.floor(grid_x * DENSITY - X_DIM / 2);
  //     const canvas_y = Math.floor(grid_y * DENSITY - Y_DIM / 2);

  //     const angle = grid[grid_y][grid_x];

  //     sketch.line(
  //       canvas_x,
  //       canvas_y,
  //       canvas_x + 0.5 * DENSITY * Math.cos(angle),
  //       canvas_y + 0.5 * DENSITY * Math.sin(angle)
  //     );
  //   }
  // }

  sketch.noFill();
  sketch.stroke("red");

  sketch.strokeWeight(1);
  let c = 0;

  for (
    let start_y = -Y_DIM / 2;
    start_y < (3 * Y_DIM) / 2;
    start_y += DENSITY * 1.5
  ) {
    for (
      let start_x = -X_DIM / 2;
      start_x < (3 * X_DIM) / 2;
      start_x += DENSITY * 1.5
    ) {
      c++;
      c % 2 === 0 ? sketch.stroke("red") : sketch.stroke("black");

      sketch.beginShape();
      let canvas_x = /* Math.random() * X_WIDTH - X_DIM / 2; */ start_x;
      let canvas_y = /* Math.random() * Y_HEIGHT - Y_DIM / 2; */ start_y;
      let curr_angle: number | undefined;
      for (let step = 0; step < NUM_STEPS; step++) {
        sketch.curveVertex(canvas_x, canvas_y);

        const grid_x = Math.floor((canvas_x + X_DIM / 2) / DENSITY);
        const grid_y = Math.floor((canvas_y + Y_DIM / 2) / DENSITY);

        if (grid_y < 0 || grid_y > grid.length - 1) break;
        if (grid_x < 0 || grid_x > grid[grid_y].length - 1) break;
        const target_angle = grid[grid_y][grid_x];

        if (curr_angle == null) {
          curr_angle = target_angle;
        }

        const CLAMP_ANGLE: boolean = true;

        if (CLAMP_ANGLE) {
          // https://stackoverflow.com/questions/1878907/the-smallest-difference-between-2-angles
          const angle_diff = Math.atan2(
            Math.sin(target_angle - curr_angle),
            Math.cos(target_angle - curr_angle)
          );

          curr_angle =
            curr_angle +
            sketch.constrain(angle_diff, -Math.PI / 8, Math.PI / 8);
        } else {
          curr_angle = target_angle;
        }

        const x_step = STEP_LENGTH * Math.cos(curr_angle);
        const y_step = STEP_LENGTH * Math.sin(curr_angle);

        canvas_x += x_step;
        canvas_y += y_step;
      }

      sketch.endShape();
    }
  }

  return state;
}
