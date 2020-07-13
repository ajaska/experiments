import moment from "moment";
import p5 from "p5";

import data from "./data.json";

export interface State {
  p5: p5;
}

const START_DATE = moment("2013-01-01");
const END_DATE = moment("2020-07-13");
const CELL_SIZE = 10;

const X_DIM = 53 * CELL_SIZE;
const Y_DIM = 7 * CELL_SIZE * (2020 - 2013 + 1);

interface CachedDay {
  data_key: string;
  renderable?: {
    color: number;
    x: number;
    y: number;
  };
}

// Pre-compute moment stuff because it's slow
let cached_days: CachedDay[] = [];

export function setup(sketch: p5): State {
  sketch.createCanvas(X_DIM, Y_DIM);

  let current_day = START_DATE.clone();
  while (current_day.isBefore(END_DATE)) {
    const data_key = current_day.format("YYYY-MM-DD");
    const color: number | undefined = (data as any)[data_key];
    if (color != null) {
      const years = parseInt(current_day.format("GGGG"));
      const week_of_year = parseInt(current_day.format("W"));
      const day_of_week = parseInt(current_day.format("E"));

      const y_offset_years = (years - 2013) * 7 * CELL_SIZE;
      const y_offset_day_of_week = (day_of_week - 1) * CELL_SIZE;
      const x_offset_week_of_year = (week_of_year - 1) * CELL_SIZE;

      const y = y_offset_years + y_offset_day_of_week;
      const x = x_offset_week_of_year;

      cached_days.push({ data_key, renderable: { color, x, y } });
    }

    current_day.add(1, "day");
  }

  return { p5: sketch };
}

export function updateState(state: State): State {
  return state;
}

export function draw(sketch: p5, state: State) {
  if (
    sketch.frameCount > 1 &&
    (sketch as any).movedX === 0 &&
    (sketch as any).movedY === 0
  ) {
    return;
  }
  sketch.colorMode(sketch.HSL, 360, 100, 100);
  sketch.background(0, 0, 100);
  sketch.noStroke();

  const years = Math.floor(sketch.mouseY / (7 * CELL_SIZE)) + 2013;
  const day_of_week =
    Math.floor((sketch.mouseY % (7 * CELL_SIZE)) / CELL_SIZE) + 1;
  const week_of_year = Math.floor(sketch.mouseX / CELL_SIZE) + 1;

  const y_offset_years = (years - 2013) * 7 * CELL_SIZE;
  const y_offset_day_of_week = (day_of_week - 1) * CELL_SIZE;
  const x_offset_week_of_year = (week_of_year - 1) * CELL_SIZE;
  const y = y_offset_years + y_offset_day_of_week;
  const x = x_offset_week_of_year;

  const when = moment(`${years} ${week_of_year} ${day_of_week}`, "GGGG W E");
  const data_key = when.format("YYYY-MM-DD");
  const color: number | undefined = (data as any)[data_key];

  const magic_color = color;

  sketch.noStroke();
  for (const day of cached_days) {
    const { renderable } = day;
    if (renderable != null) {
      const { color, x, y } = renderable;
      sketch.fill(color, 100, color === magic_color ? 50 : 70);
      sketch.rect(x, y, CELL_SIZE, CELL_SIZE);
    }
  }

  if (color != null) {
    sketch.noFill();
    sketch.stroke(0, 0, 0);
    sketch.rect(x, y, CELL_SIZE, CELL_SIZE);
  }

  if (when.isValid()) {
    sketch.fill(0, 0, 0);
    sketch.noStroke();
    sketch.text(`${data_key}: ${color == null ? "(none)" : color}`, 360, 540);
  }

  return state;
}
