import Meyda from "meyda";

export default class Audio {
  context: AudioContext;
  meyda: Meyda.MeydaAnalyzer;

  constructor(bufferSize: number) {
    if (
      window.hasOwnProperty("webkitAudioContext") &&
      !window.hasOwnProperty("AudioContext")
    ) {
      window.AudioContext = window.webkitAudioContext;
    }

    if (
      navigator.hasOwnProperty("webkitGetUserMedia") &&
      !navigator.hasOwnProperty("getUserMedia")
    ) {
      navigator.getUserMedia = (window as any).webkitGetUserMedia;
      if (!AudioContext.prototype.hasOwnProperty("createScriptProcessor")) {
        AudioContext.prototype.createScriptProcessor = (AudioContext as any).prototype.createJavaScriptNode;
      }
    }

    this.context = new AudioContext();

    let elvis = document.getElementById("elvisSong") as HTMLMediaElement;
    let stream = this.context.createMediaElementSource(elvis);
    stream.connect(this.context.destination);

    this.meyda = Meyda.createMeydaAnalyzer({
      audioContext: this.context,
      source: stream,
      bufferSize: bufferSize,
      // windowingFunction: "blackman",
    });
    this.initializeMicrophoneSampling();
  }

  async initializeMicrophoneSampling() {
    console.log("Asking for permission...");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      document.getElementById("audioControl").style.display = "none";
      console.log("User allowed microphone access.");
      console.log("Initializing AudioNode from MediaStream");
      var source = this.context.createMediaStreamSource(mediaStream);
      console.log("Setting Meyda Source to Microphone");
      this.meyda.setSource(source);
    } catch (e) {
      console.log("Permission denied");
      // We should fallback to an audio file here, but that's difficult on mobile
      if (this.context.state === "suspended") {
        const resume = () => {
          this.context.resume();

          setTimeout(() => {
            if (this.context.state === "running") {
              document.body.removeEventListener("touchend", resume, false);
            }
          }, 0);
        };

        document.body.addEventListener("touchend", resume, false);
      }
    }
  }

  get(features: Meyda.MeydaAudioFeature[]) {
    this.context.resume();
    return this.meyda.get(features);
  }
}
