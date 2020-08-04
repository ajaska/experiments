import createHash from "create-hash";
import Fingerprint2 from "fingerprintjs2";

export async function scheduleFingerprint(): Promise<string> {
  return new Promise((resolve, _reject) => {
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(function () {
        resolve(computeFingerprint());
      });
    } else {
      setTimeout(function () {
        resolve(computeFingerprint());
      }, 500);
    }
  });
}

async function computeFingerprint(): Promise<string> {
  return new Promise((resolve, _reject) => {
    Fingerprint2.get((components) => {
      const sha1 = createHash("sha1");
      for (const component of components) {
        const { key, value } = component;
        sha1.update("@@@");
        sha1.update(key);
        sha1.update(JSON.stringify(value));
      }
      resolve(sha1.digest("base64"));
    });
  });
}
