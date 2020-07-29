import * as React from "react";
import * as ReactDOM from "react-dom";

import classNames from "classnames";

interface Data {
  on: boolean;
}

declare var process: any;
const ws_url =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:1234"
    : "wss://experiments-do.ajaska.com:443/lightswitch/";

const App = () => {
  const [lights, _setLights] = React.useState(false);
  const [websocket, setWebsocket] = React.useState<WebSocket | null>(null);
  const [websocketError, setWebsocketError] = React.useState(false);

  React.useEffect(() => {
    const websocket = new WebSocket(ws_url);
    websocket.onmessage = (e) => {
      const data: Data = JSON.parse(e.data);
      setLights(data.on);
    };

    websocket.onerror = () => {
      console.log("falling back to singleplayer mode");
      setWebsocket(null);
      setWebsocketError(true);
    };

    setWebsocket(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const setLights = React.useCallback(
    (lights: boolean) => {
      _setLights(lights);
      if (websocket != null) {
        websocket.send(JSON.stringify({ on: lights }));
      }
    },
    [websocket]
  );

  if (!websocket && !websocketError) {
    return <div>Loading...</div>;
  }

  return (
    <div className={classNames("container", { "lights-out": !lights })}>
      {websocketError ? (
        <div style={{ opacity: 0.6 }}>(error connecting to server)</div>
      ) : null}
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
