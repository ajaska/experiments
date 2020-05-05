import p5 from "p5";

import { setup, updateState, draw, State } from "./sketch";

new p5((sketch) => {
  let state: State;

  sketch.setup = () => {
    state = setup(sketch);
    state.p5 = sketch;
  };

  sketch.draw = () => {
    state = updateState(state);
    draw(sketch, state);
  };
}, document.getElementById("p5canvas")!);
