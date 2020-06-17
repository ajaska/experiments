// Yoinked from https://codepen.io/arickle/pen/XKjMZY
function addRain() {
  const rain = document.querySelectorAll(".rain");
  if (!rain) return;

  let increment = 0;
  let drops = "";

  while (increment < 100) {
    //couple random numbers to use for constious randomizations
    //random number between 98 and 1
    const randoHundo = Math.floor(Math.random() * 97) + 1;
    //random number between 5 and 2
    const randoFiver = Math.floor(Math.random() * 3) + 2;
    //increment
    increment += randoFiver;
    //add in a new raindrop with constious randomizations to certain CSS properties
    drops +=
      '<div class="drop" style="left: ' +
      increment +
      "%; bottom: " +
      (randoFiver + randoFiver - 1 + 100) +
      "%; animation-delay: 0." +
      randoHundo +
      "s; animation-duration: 0.5" +
      randoHundo +
      's;"><div class="stem" style="animation-delay: 0.' +
      randoHundo +
      "s; animation-duration: 0.5" +
      randoHundo +
      's;"></div><div class="splat" style="animation-delay: 0.' +
      randoHundo +
      "s; animation-duration: 0.5" +
      randoHundo +
      's;"></div></div>';
  }

  const frontRow = document.querySelector(".rain.front-row");
  frontRow!.innerHTML += drops;
}

addRain();
