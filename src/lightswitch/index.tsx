import * as React from "react";
import * as ReactDOM from "react-dom";

import classNames from "classnames";

const App = () => {
  const [lights, setLights] = React.useState(false);

  return (
    <div className={classNames("container", { "lights-out": !lights })}>
      <div className="switch-box">
        <div className={classNames("toggle-switch-holder", { off: lights })}>
          <div
            className="toggle-switch-top"
            onClick={() => (lights ? null : setLights(true))}
          />
          <div
            className="toggle-switch-bottom"
            onClick={() => (lights ? setLights(false) : null)}
          />
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("react"!));
