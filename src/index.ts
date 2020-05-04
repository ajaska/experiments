import p5 from "p5";

import { setup, draw, State } from "./sketch";

new p5((sketch) => {
  let state: State;

  sketch.setup = () => {
    state = setup(sketch);
  };

  sketch.draw = () => {
    state = { ...draw(sketch, state), frame: state.frame + 1 };
  };
}, document.getElementById("p5canvas")!);
