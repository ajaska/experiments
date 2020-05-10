export function calculateFlux(
  // timestamp: number,
  lastBandMagnitudes: Float32Array,
  nextBandMagnitudes: Float32Array
) {
  const diffs = new Float32Array(nextBandMagnitudes.length);
  for (let i = 0; i < nextBandMagnitudes.length; i++) {
    // Log requires > 0
    let lastMag = lastBandMagnitudes[i] || 0.00000001;
    let nextMag = nextBandMagnitudes[i] || 0.00000001;

    lastMag = Math.log10(lastMag);
    nextMag = Math.log10(nextMag);

    // Multiply by 10 to make it easier to see :shrug:
    const flux = 10 * Math.max(0, lastMag - nextMag);
    diffs[i] = flux;
  }
  return diffs;
}
