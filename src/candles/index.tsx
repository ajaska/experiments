import * as React from "react";
import * as ReactDOM from "react-dom";

import classNames from "classnames";

declare var process: any;
const ws_url =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:1236"
    : "wss://experiments-do.ajaska.com:443/candles/";

interface CandleProps {
  message: string | null;
  setMessage: (message: string | null) => void;
}

const Candle = (props: CandleProps) => {
  const [mine, setMine] = React.useState(false);
  const [composing, setComposing] = React.useState(false);
  const [composedMessage, setComposedMessage] = React.useState("");

  const inputRef = React.useRef<HTMLInputElement>(null);

  const { message, setMessage } = props;
  const lit = message != null;
  const setLit = (x: boolean) => {
    if (!mine && message == null) setMine(true);
    if (mine || message == null) setComposing(true);

    // This input hack (instead of just using autoFocus) is to work around
    // a limitation of iOS.
    // https://github.com/JedWatson/react-select/issues/3501
    const input = inputRef.current;
    if (input != null) {
      input.focus();
    }

    setMessage(x ? "" : null);
  };

  const [animationDelay] = React.useState(
    (Math.random() * -4).toFixed(1) + "s"
  );
  const [animationDuration] = React.useState(
    (Math.random() + 3.5).toFixed(1) + "s"
  );

  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setComposing(false);
        setComposedMessage("");
        setMessage(composedMessage);
      }}
    >
      <input
        type="text"
        value={composedMessage}
        onChange={(e) => setComposedMessage(e.currentTarget.value)}
        onBlur={() => {
          if (composing) {
            setComposing(false);
            setComposedMessage("");
            setMessage(composedMessage);
          }
        }}
        placeholder="Leave a message..."
        className="composer"
        ref={inputRef}
      />
    </form>
  );

  return (
    <div
      className={classNames("candle-frame", { lit })}
      onClick={() => setLit(!lit)}
    >
      <div
        className={classNames("candle", { unlit: !lit })}
        style={{ animationDelay, animationDuration }}
      >
        <div className="flame">
          <div className="shadows" />
          <div
            className="orange"
            style={{ animationDelay, animationDuration }}
          />
          <div className="blue" />
        </div>
        <div className="wick" />
        <div className="wax" />
      </div>
      <div className={classNames("message", { composing })}>
        {lit && message}
        <div className="composer-holder">{composer}</div>
      </div>
    </div>
  );
};

const App = () => {
  const [websocket, setWebsocket] = React.useState<WebSocket | null>(null);
  const [websocketError, setWebsocketError] = React.useState(false);
  const [messages, setMessages] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    const websocket = new WebSocket(ws_url);
    websocket.onmessage = (e) => {
      const data: (string | null)[] = JSON.parse(e.data);
      setMessages(data);
    };

    websocket.onerror = (e) => {
      console.log("websocket error", e);
      setWebsocket(null);
      setWebsocketError(true);
    };

    websocket.onclose = (e) => {
      console.log("websocket closed", e);
      setWebsocket(null);
      setWebsocketError(true);
    };

    setWebsocket(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  if (websocket == null && !websocketError) {
    return <div>Loading...</div>;
  } else if (websocket == null) {
    return <div>Error connecting to server</div>;
  }

  const candleNodes = [...Array(20).keys()].map((i: number) => (
    <Candle
      key={i}
      message={messages[i]}
      setMessage={(message: null | string) =>
        websocket.send(JSON.stringify({ message, i }))
      }
    />
  ));

  return <div className="container">{candleNodes}</div>;
};

ReactDOM.render(<App />, document.getElementById("react"!));
