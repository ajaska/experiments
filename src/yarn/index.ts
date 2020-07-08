import p5 from "p5";
import produce from "immer";

import { setup, updateState, draw, State } from "./sketch";

new p5((sketch) => {
  let state: State;

  sketch.setup = () => {
    state = setup(sketch);
    state.p5 = sketch;
  };

  sketch.draw = () => {
    state = produce(state, updateState);
    draw(sketch, state);
  };
}, document.getElementById("p5canvas")!);
