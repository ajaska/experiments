async function getAccess() {
  return await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
}

function onAudioData(ws: WebSocket, data: Float32Array) {
  // console.log("Sending data", data);
  ws.send(String(Math.floor(performance.now())));
  ws.send(data.buffer);
}

async function main() {
  const img = document.getElementById("gif");
  const sgif = new window.SuperGif({ gif: img });
  let loaded = false;
  let gifFrames = 0;
  sgif.load(() => {
    console.log("Frames: ", sgif.get_length());
    gifFrames = sgif.get_length();
    loaded = true;
  });

  const stream = await getAccess();
  console.log(stream);

  // 44100 is madmom default
  const context = new AudioContext({ sampleRate: 44100 });
  const source = context.createMediaStreamSource(stream);

  // 2048 = frame_size ?
  // madmom expects this to be = hop_size = 441 OOF
  const processor = context.createScriptProcessor(1024, 1, 1);
  processor.connect(context.destination);

  source.connect(processor);

  const ws = new WebSocket("ws://192.168.1.249:9001");
  let recoveryMode = 0;

  processor.onaudioprocess = (e: AudioProcessingEvent) => {
    if (recoveryMode > 0) {
      recoveryMode -= 1;
      return;
    }
    onAudioData(ws, e.inputBuffer.getChannelData(0));
  };

  ws.onerror = ws.onclose = () => {
    processor.onaudioprocess = null;
  };

  const app = document.getElementById("app")!;
  const app2 = document.getElementById("app2")!;
  const bpm = document.getElementById("bpm")!;

  const beatTags = [
    document.getElementById("beat1")!,
    document.getElementById("beat2")!,
    document.getElementById("beat3")!,
    document.getElementById("beat4")!,
  ];

  let frames = 0;
  let beats = 0;

  window.onclick = () => {
    beats = 3;
  };

  function intensityToHSL(intensity: number): string {
    return `hsl(240, 100%, ${Math.floor(100 - intensity / 2)}%)`;
  }

  let maxA = 0;

  ws.onmessage = (event) => {
    frames += 1;

    let [left, right] = event.data.split("|");
    if (frames % 5 === 0) {
      const RTT = Math.floor(performance.now()) - Number(left);
      console.log("RTT", RTT);
      if (RTT > 500) {
        recoveryMode = 10;
      }
      if (RTT < 100) {
        recoveryMode = 0;
      }
    }
    // console.log(JSON.parse(right));
    const data = JSON.parse(right);

    if (data["b"]) {
      beats = (beats + 1) % 4;
    }

    if (data["b"]) {
      beatTags[beats].style.backgroundColor = app.style.backgroundColor =
        "#0000FF";
      maxA = 0;
    } else if (data["b2"]) {
      const a = Math.max(Math.min(data["a"], 10), 0) * 10;
      beatTags[
        beats
      ].style.backgroundColor = app.style.backgroundColor = intensityToHSL(a);
    } else {
      beatTags[beats].style.backgroundColor = "#EAEAEA";
      app.style.backgroundColor = "#FFFFFF";
    }
    maxA = Math.max(maxA, data["a"]);
    beatTags[beats].innerText = String(maxA);

    if (data["p"] > 90) {
      beatTags[(beats + 1) % 4].style.backgroundColor = intensityToHSL(
        data["p"] / 2
      );
    }

    let gifPos;
    if (data["b"] && beats % 2 === 0) {
      gifPos = 0;
    } else {
      gifPos = Math.floor(
        // (((beats % 2) * 50 + data["p"] / 2) / 100) * gifFrames
        (data["p"] / 100) * gifFrames
      );
    }
    if (loaded && sgif.get_current_frame() != gifPos) {
      sgif.move_to(gifPos);
    }

    // app2.style.width = `${Math.floor(data["p"] * 4)}px`;
    app2.style.backgroundColor = `hsl(${
      Math.floor(240 + beats * 90 + (data["p"] * 90) / 100) % 360
    }, 100%, 50%)`; //${Math.floor(100 - data["p"] / 2)}%`;

    bpm.innerText = data["t"];
  };

  // app.style.width = "100vw";
  // app.style.height = "100vh";
  app.style.width = "400px";
  app.style.height = "400px";
  app.style.backgroundColor = "#FFFFFF";

  app2.style.width = "400px";
  app2.style.height = "100px";
  app2.style.backgroundColor = "#FFFFFF";
}

main();
