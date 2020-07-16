import * as React from "react";
import * as ReactDOM from "react-dom";

let storage = localStorage.getItem("sliders") as unknown;
const preExisting =
  typeof storage === "string" ? parseInt(storage, 10) : undefined;

const App = () => {
  const [sliders, setSliders] = React.useState(
    preExisting == null ? 10 : preExisting
  );

  // Lol side effect in the render function
  localStorage.setItem("sliders", sliders.toString());

  const sliderNodes = [...Array(sliders).keys()].map((n) => (
    <input
      type="range"
      min="0"
      max="100"
      value={sliders}
      onChange={(e) => setSliders(e.target.valueAsNumber)}
      key={n}
    />
  ));
  return (
    <div>
      {sliders}
      <div>{sliderNodes}</div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("react"!));
