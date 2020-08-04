import * as React from "react";
import * as ReactDOM from "react-dom";

import { scheduleFingerprint } from "./fingerprint";
import { useWebsocket, ReadyState } from "./websocket_hook";

const LOCAL_STORAGE_KEY = "please-dont-go";
const lsBan = localStorage.getItem(LOCAL_STORAGE_KEY) != null;

const App = () => {
  const [fingerprint, setFingerprint] = React.useState<string | null>(null);
  const [banned, setBanned] = React.useState(lsBan);
  const [calledBack, setCalledBack] = React.useState(false);
  const [phonedHome, setPhonedHome] = React.useState(false);
  const [loadStart, setLoadStart] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const fingerprint = await scheduleFingerprint();
      setFingerprint(fingerprint);
    })();
  }, []);

  const { websocketState, sendMessage } = useWebsocket((message: string) => {
    const data = JSON.parse(message);
    if ("x" in data && data["x"]) {
      setBanned(true);
      if (!lsBan) {
        localStorage.setItem(LOCAL_STORAGE_KEY, "yes");
      }
    }
    setCalledBack(true);
  });

  React.useEffect(() => {
    if (fingerprint == null) return;
    if (websocketState !== ReadyState.OPEN) return;
    if (phonedHome) return;

    sendMessage(JSON.stringify({ fingerprint, lsBan }));
    setPhonedHome(true);
  }, [fingerprint, websocketState]);

  React.useEffect(() => {
    if (banned) return;

    const f = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Please don't go.";
    };
    window.addEventListener("beforeunload", f);
    return () => {
      window.removeEventListener("beforeunload", f);
    };
  }, [banned]);

  React.useEffect(() => {
    // Give a quick period to connect before we show a loading message
    setTimeout(() => {
      setLoadStart(false);
    }, 500);
  }, []);

  if (lsBan || banned) {
    return (
      <div className="container">
        <p style={{ maxWidth: 400, textAlign: "center" }}>
          Why did you leave? Horrible things happened here. There's nothing left
          to see now.
        </p>
      </div>
    );
  }

  if (loadStart) {
    return <div className="container" />;
  }

  if (!phonedHome || !calledBack) {
    return <div className="container">Loading...</div>;
  }

  const rabbit = `
　　　　　　　　　∩∩
　　　　　　　　（´･ω･）
　　　　　　　 ＿|　⊃／(＿＿_  
　　　　　　／　└-(＿＿＿_／ 

I just had the most terrible dream.
It feels like something awful is about to happen.
Please don't go.
`;

  return (
    <div className="container">
      <div className="rabbit">
        <pre>{rabbit}</pre>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("react"!));
