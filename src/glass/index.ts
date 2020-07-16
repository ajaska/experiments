function canUseDeviceOrientation() {
  return (
    DeviceOrientationEvent &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  );
}

async function configureDeviceOrientationListener() {
  try {
    if (!canUseDeviceOrientation()) {
      const error = document.getElementById("error")!;
      error.innerText = "Please try again on a mobile device :D";
      return;
    }

    const response = await DeviceOrientationEvent.requestPermission();

    if (response === "granted") {
      const clickme = document.getElementById("clickme")!;
      console.log("granted");
      window.addEventListener("deviceorientation", (e) => {
        clickme.innerText = `A:${e.alpha.toFixed(2)} B:${e.beta.toFixed(
          2
        )} G:${e.gamma.toFixed(2)} ${e.absolute}`;
      });
    } else if (response === "denied") {
      alert("denied"); // TODO
    } else {
      throw new Error("Unknown DeviceOrientationEvent response");
    }
  } catch (e) {
    alert(e.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const clickme = document.getElementById("clickme")!;
  clickme.addEventListener("click", () => {
    configureDeviceOrientationListener();
  });
});
