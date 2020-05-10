import * as THREE from "three";

import BeatDetektor from "./beatdetektor";

import Audio from "./audio";
import { groupLogBands } from "./fftMagnitudeGrouper";
import { calculateFlux } from "./calculateFlux";

export default function main() {
  var scale = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
  const bufferSize = 1024;
  // const bufferSize = 512;
  let a = new Audio(bufferSize);

  var aspectRatio = 16 / 10;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 1000);

  var initializeFFTs = function (numFFTs: number, pointCount: number) {
    var ffts = [];
    for (var i = 0; i < numFFTs; i++) {
      ffts.push(groupLogBands(new Float32Array(pointCount)));
    }

    return ffts;
  };

  var material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
  });

  var yellowMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
  });

  var ffts = initializeFFTs(20, bufferSize);
  var buffer = null;

  var fluxes = new Float32Array(128);
  var fluxIndex = 0;

  var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
  });

  function resize() {
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "auto";

    var resolution = (renderer.domElement.clientWidth / 16) * 10;
    renderer.setPixelRatio(
      window.devicePixelRatio ? window.devicePixelRatio : 1
    );

    renderer.setSize(resolution * aspectRatio, resolution);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "auto";

    camera.aspect = (resolution * aspectRatio) / resolution;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener("resize", resize);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  camera.position.z = 5;

  // Unchanging variables
  const length = 1;
  const hex = 0xffff00;
  const dir = new THREE.Vector3(0, 1, 0);
  const rightDir = new THREE.Vector3(1, 0, 0);
  const origin = new THREE.Vector3(1, -6, -15);

  // Variables we update
  let centroidArrow = new THREE.ArrowHelper(dir, origin, length, hex);
  let rolloffArrow = new THREE.ArrowHelper(dir, origin, length, 0x0000ff);
  let rmsArrow = new THREE.ArrowHelper(rightDir, origin, length, 0xff00ff);
  let lines = new THREE.Group(); // Lets create a seperate group for our lines
  let lines2 = new THREE.Group();
  // let loudnessLines = new THREE.Group();
  scene.add(centroidArrow);
  scene.add(rolloffArrow);
  scene.add(rmsArrow);

  // Render Spectrogram
  for (let i = 0; i < ffts.length; i++) {
    if (ffts[i]) {
      let geometry = new THREE.BufferGeometry(); // May be a way to reuse this

      let positions = new Float32Array(ffts[i].length * 3);

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setDrawRange(0, ffts[i].length);

      let line = new THREE.Line(geometry, material);
      lines.add(line);

      positions = line.geometry.attributes.position.array;
    }
  }

  // ajaska: Render ...Fluxogram
  for (let i = 0; i < fluxes.length; i++) {
    let geometry = new THREE.BoxGeometry(0.04, fluxes[i] || 0.1, 0.01);

    const box = new THREE.Mesh(geometry, material);
    box.position.set(-0.08 * (fluxes.length - i), -5, -20);

    lines2.add(box);
  }

  let bufferLineGeometry = new THREE.BufferGeometry();
  let bufferLine = new THREE.Line(bufferLineGeometry, material);
  {
    let positions = new Float32Array(bufferSize * 3);
    bufferLineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    bufferLineGeometry.setDrawRange(0, bufferSize);

    positions = bufferLine.geometry.attributes.position.array;
  }
  scene.add(bufferLine);
  scene.add(lines);
  scene.add(lines2);

  // scene.add(loudnessLines);

  let features = null;
  let chromaWrapper = document.querySelector("#chroma");
  let mfccWrapper = document.querySelector("#mfcc");

  let beatDetektor = new BeatDetektor(85, 169);
  // let beatDetektor = new BeatDetektor(80, 120);
  let beatDetektorKick = new BeatDetektor.modules.vis.BassKick();
  let bpm = 0;

  function render(ts: number) {
    features = a.get([
      "amplitudeSpectrum",
      "spectralCentroid",
      "spectralRolloff",
      "loudness",
      "rms",
      "chroma",
      "mfcc",
      "complexSpectrum", // beat detektor
    ]);
    if (features) {
      {
        beatDetektor.process(ts / 1000, features.complexSpectrum.real);
        beatDetektorKick.process(beatDetektor);
        bpm = beatDetektor.win_bpm_int_lo || bpm;
        // console.log(
        //   beatDetektor.win_bpm_int,
        //   beatDetektor.winning_bpm,
        //   beatDetektor.win_val
        // );
        // console.log(bpm, beatDetektorKick.isKick());
      }

      if (chromaWrapper && features.chroma) {
        chromaWrapper.innerHTML = features.chroma.reduce(
          (acc, v, i) =>
            `${acc}
          <div class="chroma-band" style="background-color: rgba(0,${Math.round(
            255 * v
          )},0,1)">${scale[i]}</div>`,
          ""
        );
      }

      if (mfccWrapper && features.mfcc) {
        mfccWrapper.innerHTML = features.mfcc.reduce(
          (acc, v, i) =>
            `${acc}
          <div class="mfcc-band" style="background-color: rgba(0,${
            Math.round(v + 25) * 5
          },0,1)">${i}</div>`,
          ""
        );
      }

      ffts.pop();
      ffts.unshift(groupLogBands(features.amplitudeSpectrum));
      const windowedSignalBuffer = a.meyda._m.signal;

      const fftDiff = calculateFlux(ffts[0], ffts[1]);
      fftDiff.sort();
      const mid = Math.ceil(fftDiff.length / 2);
      const median =
        fftDiff.length % 2 == 0
          ? (fftDiff[mid] + fftDiff[mid - 1]) / 2
          : fftDiff[mid - 1];

      fluxes[fluxIndex] = median;

      if (median > 1) console.log(median);
      if (median > 1) {
        lines2.children[fluxIndex].scale.set(1, median * 25, 1);
      } else {
        lines2.children[fluxIndex].scale.set(1, 0.1, 1);
      }
      //geometry.parameters.height = median || 0.1;
      // lines2.children[fluxIndex].geometry.verticesNeedUpdate = true;
      fluxIndex = (fluxIndex + 1) % fluxes.length;

      // if (median > 1) console.log(median);

      for (let i = 0; i < ffts.length; i++) {
        var positions = lines.children[i].geometry.attributes.position.array;
        var index = 0;

        for (var j = 0; j < ffts[i].length * 3; j++) {
          positions[index++] = 10.7 + 8 * Math.log10(j / ffts[i].length);
          positions[index++] = -5 + 0.1 * ffts[i][j];
          positions[index++] = -15 - i;
        }

        lines.children[i].geometry.attributes.position.needsUpdate = true;
      }

      // Render Spectral Centroid Arrow
      if (features.spectralCentroid) {
        // SpectralCentroid is an awesome variable name
        // We're really just updating the x axis
        centroidArrow.position.set(
          10.7 + 8 * Math.log10(features.spectralCentroid / (bufferSize / 2)),
          -6,
          -15
        );
      }

      // Render Spectral Rolloff Arrow
      if (features.spectralRolloff) {
        // We're really just updating the x axis
        var rolloff = features.spectralRolloff / 22050;
        rolloffArrow.position.set(10.7 + 8 * Math.log10(rolloff), -6, -15);
      }
      // Render RMS Arrow
      if (features.rms) {
        // We're really just updating the y axis
        rmsArrow.position.set(-11, -5 + 10 * features.rms, -15);
      }

      // ajaska - this is the thing at the top of the animation
      if (windowedSignalBuffer) {
        // Render Signal Buffer
        let positions = bufferLine.geometry.attributes.position.array;
        let index = 0;
        for (var i = 0; i < bufferSize; i++) {
          positions[index++] = -11 + (22 * i) / bufferSize;
          positions[index++] = 4 + windowedSignalBuffer[i] * 5;
          positions[index++] = -25;
        }
        bufferLine.geometry.attributes.position.needsUpdate = true;
      }

      // // Render loudness
      // if (features.loudness && features.loudness.specific) {
      //   for (var i = 0; i < features.loudness.specific.length; i++) {
      //     let geometry = new THREE.Geometry();
      //     geometry.vertices.push(new THREE.Vector3(
      //       -11 + 22 * i / features.loudness.specific.length,
      //       -6 + features.loudness.specific[i] * 3,
      //       -15
      //     ));
      //     geometry.vertices.push(new THREE.Vector3(
      //       -11 + 22 * i / features.loudness.specific.length + 22 /
      //       features.loudness.specific.length,
      //       -6 + features.loudness.specific[i] * 3,
      //       -15
      //     ));
      //     loudnessLines.add(new THREE.Line(geometry, yellowMaterial));
      //     geometry.dispose();
      //   }
      // }

      // for (let c = 0; c < loudnessLines.children.length; c++) {
      //   loudnessLines.remove(loudnessLines.children[c]); //forEach is slow
      // }
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
}
