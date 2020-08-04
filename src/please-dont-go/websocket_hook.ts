import * as React from "react";

declare var process: any;
const ws_url =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:1237"
    : "wss://experiments-do.ajaska.com:443/please-dont-go/";

export enum ReadyState {
  CONNECTING = 1,
  OPEN,
  RECONNECTING,
}

interface UseWebsocketReturn {
  websocketState: ReadyState;
  sendMessage: (message: string) => void;
}

export const useWebsocket = (
  onMessage: (message: string) => void
): UseWebsocketReturn => {
  const websocket = React.useRef<WebSocket>();
  const [websocketState, setWebsocketState] = React.useState<ReadyState>(
    ReadyState.CONNECTING
  );

  React.useEffect(() => {
    console.log(websocketState, ReadyState[websocketState]);
    if (websocketState !== ReadyState.CONNECTING) {
      return;
    }
    console.log("resetting...");

    const ws = new WebSocket(ws_url);

    ws.onmessage = (e) => {
      onMessage(e.data);
    };

    ws.onerror = (e) => {
      console.log("websocket error", e);
      setWebsocketState(ReadyState.RECONNECTING);
    };

    ws.onclose = (e) => {
      console.log("websocket closed", e);
      setWebsocketState(ReadyState.RECONNECTING);
    };

    ws.onopen = (e) => {
      console.log("websocket opened", e);
      setWebsocketState(ReadyState.OPEN);
    };

    websocket.current = ws;
  }, [websocketState]);

  React.useEffect(() => {
    if (websocket.current != null) {
      websocket.current.onmessage = (e) => {
        onMessage(e.data);
      };
    }
  }, [onMessage, websocketState]);

  // Websocket monitor
  React.useEffect(() => {
    const id = setInterval(() => {
      if (
        websocket.current &&
        websocket.current.readyState === WebSocket.CLOSED
      ) {
        setWebsocketState(ReadyState.CONNECTING);
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const sendMessage = React.useCallback(
    (message: string) => {
      if (websocket.current != null && websocketState === ReadyState.OPEN) {
        websocket.current.send(message);
      }
    },
    [websocketState]
  );

  return { websocketState, sendMessage };
};
