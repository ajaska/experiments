import * as React from "react";
import * as ReactDOM from "react-dom";

interface Goodbye {
  message: string;
  when: number;
}

let storage = localStorage.getItem("saying-goodbye") as unknown;
const memories: Goodbye[] =
  typeof storage === "string" ? JSON.parse(storage) : [];

const setMemories = (newMemories: Goodbye[]) => {
  localStorage.setItem("saying-goodbye", JSON.stringify(newMemories));
};

const TIMING = 240_000;

const App = () => {
  const [message, setMessage] = React.useState("");
  const [goodbyes, setGoodbyes] = React.useState(memories);

  const now = Date.now();
  const goodbyeNodes = goodbyes
    .filter((goodbye) => goodbye.when + TIMING > now)
    .map((goodbye) => {
      const delaySeconds = Math.round(goodbye.when - now / 1000); // negative number
      // Only bother with this if we know we're reloaded
      const animationDelay =
        delaySeconds < -10 ? `${delaySeconds}s` : undefined;
      return (
        <div className="goodbye" key={goodbye.when} style={{ animationDelay }}>
          {goodbye.message}
        </div>
      );
    });

  return (
    <div>
      <div
        title="Type the things you need to say and they'll fade out over the next few minutes."
        className="help"
      >
        about
      </div>
      <div
        title="Copy all to clipboard (including hidden)"
        className="copy"
        onClick={() => {
          const el = document.createElement("textarea");
          el.value = goodbyes.map((goodbye) => goodbye.message).join("\n");
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        }}
      >
        copy
      </div>
      <div
        title="Delete everything"
        className="clear"
        onClick={() => {
          setGoodbyes([]);
          setMemories([]);
        }}
      >
        clear
      </div>
      <div className="spacer" style={{ height: "50vh" }} />
      <div className="container">
        <form
          onSubmit={(e) => {
            const now = Date.now();
            setGoodbyes([...goodbyes, { message, when: now }]);
            setMemories([...goodbyes, { message, when: now }]);
            setMessage("");
            e.preventDefault();
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            placeholder="Let something go..."
            className="big-input"
          />
        </form>
        <div className="goodbyes">{goodbyeNodes}</div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("react"!));
