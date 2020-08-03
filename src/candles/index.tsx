import * as React from "react";
import * as ReactDOM from "react-dom";

import classNames from "classnames";

const Candle = () => {
  const [lit, setLit] = React.useState(true);

  const [animationDelay] = React.useState(
    (Math.random() * -4).toFixed(1) + "s"
  );
  const [animationDuration] = React.useState(
    (Math.random() + 3.5).toFixed(1) + "s"
  );

  return (
    <div
      className={classNames("candle", { unlit: !lit })}
      style={{ animationDelay, animationDuration }}
      onClick={() => setLit(!lit)}
    >
      <div className="flame">
        <div className="shadows" />
        <div className="orange" style={{ animationDelay, animationDuration }} />
        <div className="blue" />
      </div>
      <div className="wick" />
      <div className="wax" />
    </div>
  );
};

const App = () => {
  const candles = [...Array(20).keys()].map((i: number) => <Candle key={i} />);

  return <div className="container">{candles}</div>;
};

ReactDOM.render(<App />, document.getElementById("react"!));
