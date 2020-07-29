import * as React from "react";
import * as ReactDOM from "react-dom";

import classNames from "classnames";

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.platform) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

declare var require: any;
const audioFile: string = require("url:./switch.mp3");
if (!isIOS) {
  new Audio(audioFile); // Preload
}

interface Data {
  on: boolean;
}

declare var process: any;
const ws_url =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:1235"
    : "wss://experiments-do.ajaska.com:443/lightswitch/";

const playAudio = () => {
  if (!isIOS) {
    const audio = new Audio(audioFile);
    audio.volume = 0.2;
    audio.play();
  }
};

const App = () => {
  const [lights, _setLights] = React.useState(false);
  const [websocket, setWebsocket] = React.useState<WebSocket | null>(null);
  const [websocketError, setWebsocketError] = React.useState(false);

  React.useEffect(() => {
    const websocket = new WebSocket(ws_url);
    websocket.onmessage = (e) => {
      const data: Data = JSON.parse(e.data);
      _setLights(data.on);
      playAudio();
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
      playAudio();
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
