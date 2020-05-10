const SAMPLE_RATE = 44100;
const MIN_FREQUENCY = 100;
const MAX_FREQUENCY = 5512;

const NYQUIST_FREQUENCY = SAMPLE_RATE / 2;
const BANDS_PER_OCTAVE = 2;
// Where does this come from? It has something to do with the frequencyBands...
// I guess there's 5-6 octaves between 100-5512Hz?

export function groupLogBands(magSpectrum: Float32Array) {
  // todo: Chunk into 21 bands as A. Klapuri recommends
  // From 44 Hz to 18 Khz with lowest 3 being one octave;
  // remaining being 1/3 octave
  // Currently: chunk into 12 bands logarithmically (as tempibeat does)
  // const frequencyBands = 12;
  // See comment above

  /// Applies logical banding on top of the spectrum data. The bands are grouped by octave throughout the spectrum. Note that the actual min and max frequencies in the resulting band may be lower/higher than the minFrequency/maxFrequency because the band spectrum <i>includes</i> those frequencies but isn't necessarily bounded by them.

  // The max can't be any higher than the nyquist
  let actualMaxFrequency = Math.min(NYQUIST_FREQUENCY, MAX_FREQUENCY);

  // The min can't be 0 otherwise we'll divide octaves infinitely
  let actualMinFrequency = Math.max(1, MIN_FREQUENCY);

  // Define the octave frequencies we'll be working with. Note that in order to always include minFrequency, we'll have to set the lower boundary to the octave just below that frequency.
  var curFreq = actualMaxFrequency;
  var octaveBoundaryFreqs = [curFreq];
  do {
    curFreq /= 2;
    octaveBoundaryFreqs.push(curFreq);
  } while (curFreq > actualMinFrequency);

  octaveBoundaryFreqs = octaveBoundaryFreqs.reverse();

  let bandMagnitudes: number[] = [];

  // Break up the spectrum by octave
  for (let i = 0; i < octaveBoundaryFreqs.length - 1; i++) {
    let lowerFreq = octaveBoundaryFreqs[i];
    let upperFreq = octaveBoundaryFreqs[i + 1];

    let mags = magsInFreqRange(magSpectrum, lowerFreq, upperFreq);
    let ratio = mags.length / BANDS_PER_OCTAVE;

    // Now that we have the magnitudes within this octave, cluster them into bandsPerOctave groups and average each group.
    for (let j = 0; j < BANDS_PER_OCTAVE; j++) {
      let startIdx = Math.floor(ratio * j);
      var stopIdx = Math.floor(ratio * (j + 1)) - 1; // inclusive

      stopIdx = Math.max(0, stopIdx);

      if (stopIdx <= startIdx) {
        bandMagnitudes.push(mags[startIdx]);
      } else {
        let avg = fastAverage(mags, startIdx, stopIdx + 1);
        bandMagnitudes.push(avg);
      }
    }
  }

  return new Float32Array(bandMagnitudes);
}

function magsInFreqRange(
  magSpectrum: Float32Array,
  lowerFreq: number,
  upperFreq: number
) {
  const bandwidth = NYQUIST_FREQUENCY / magSpectrum.length;
  let lowIndex = Math.floor(lowerFreq / bandwidth);
  var highIndex = Math.floor(upperFreq / bandwidth);

  if (lowIndex == highIndex) {
    // Occurs when both params are so small that they both fall into the first index
    highIndex += 1;
  }

  return Array.from(magSpectrum.slice(lowIndex, highIndex));
}

function fastAverage(mags: number[], start: number, stop: number) {
  let sum = 0;
  for (let i = start; i < stop; i++) {
    sum += mags[i];
  }
  return sum / (stop - start);
}
