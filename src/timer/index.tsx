import * as React from "react";
import * as ReactDOM from "react-dom";

declare var require: any;
const audioFile: string = require("url:./chime.mp3");
new Audio(audioFile); // Preload

const playAudio = async () => {
  const audio = new Audio(audioFile);
  audio.volume = 0.2;
  audio.play();
};

const svgSize = 400;
const radius = 180;
const circumference = 2 * Math.PI * radius;

// Yoinked from:
// https://css-tricks.com/using-requestanimationframe-with-react-hooks/
const useAnimationFrame = (
  callback: (deltaTime: number) => void,
  depends: any[]
) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef<DOMHighResTimeStamp>();
  const previousTimeRef = React.useRef<DOMHighResTimeStamp>();

  const animate = (time: DOMHighResTimeStamp) => {
    if (previousTimeRef.current != null) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current != null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, depends); // Make sure the effect runs only once
};

// const Counter = () => {
//   const [count, setCount] = React.useState(0);
//
//   useAnimationFrame((deltaTime) => {
//     // Pass on a function to the setter of the state
//     // to make sure we always have the latest state
//     setCount((prevCount) => (prevCount + deltaTime * 0.01) % 100);
//   });
//
//   return <div>{Math.round(count)}</div>;
// };

enum TimerState {
  Stopped = 1,
  Running,
  Paused,
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const App = () => {
  const [timerDuration] = React.useState(25 * 60);
  const [remainingTime, setRemainingTime] = React.useState(timerDuration);
  const [timerState, setTimerState] = React.useState(TimerState.Stopped);

  useAnimationFrame(
    (deltaTime: number) => {
      if (timerState === TimerState.Running) {
        setRemainingTime((remainingTime) => {
          const newRemainingTime = remainingTime - deltaTime / 1000.0;
          if (newRemainingTime <= 0) {
            setTimerState(TimerState.Stopped);
            playAudio();
            return timerDuration;
          }
          return newRemainingTime;
        });
      }
    },
    [timerState, timerDuration]
  );

  // Experiments to determine accuracy of requestAnimationFrame timing;
  // It's pretty good. Roughly offset by ~50 ms and doesn't skew.
  // const [firstRender] = React.useState(performance.now());
  // const elapsed = (performance.now() - firstRender) / 1000;
  // const drift = elapsed - remainingTime;
  // console.debug(`Animation is off by: ${(drift * 1000).toFixed(2)}ms`);

  const TimerButtons = React.useMemo(
    () => (props: { state: TimerState }) => {
      switch (props.state) {
        case TimerState.Stopped: {
          return (
            <>
              <button disabled={true}>Cancel</button>
              <button onClick={() => setTimerState(TimerState.Running)}>
                Start
              </button>
            </>
          );
        }
        case TimerState.Paused: {
          return (
            <>
              <button
                onClick={() => {
                  setTimerState(TimerState.Stopped);
                  setRemainingTime(timerDuration);
                }}
              >
                Cancel
              </button>
              <button onClick={() => setTimerState(TimerState.Running)}>
                Start
              </button>
            </>
          );
        }
        case TimerState.Running: {
          return (
            <>
              <button
                onClick={() => {
                  setTimerState(TimerState.Stopped);
                  setRemainingTime(timerDuration);
                }}
              >
                Cancel
              </button>
              <button onClick={() => setTimerState(TimerState.Paused)}>
                Pause
              </button>
            </>
          );
        }
      }
    },
    [timerState]
  );

  return (
    <div className="container">
      <TimerButtons state={timerState} />
      <svg height={svgSize} width={svgSize}>
        <circle
          className="svg-circle base"
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
        />
        <circle
          className="svg-circle timer"
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - remainingTime / timerDuration)}
        />
        <text
          className="svg-text"
          x={svgSize / 2}
          y={svgSize / 2}
          textAnchor="middle"
        >
          {formatTime(remainingTime)}
        </text>
      </svg>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("react"!));
