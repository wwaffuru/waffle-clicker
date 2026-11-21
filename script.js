
let waffles = 0;
let clickPower = 1;
let autoPower = 0;

const upgrades = {
  click: { cost: 20, increase: 1, type: "click" },
  syrup: { cost: 100, increase: 5, type: "click" },
  auto: { cost: 40, increase: 1, type: "auto" },
  bakery: { cost: 180, increase: 5, type: "auto" },
  farm: { cost: 600, increase: 20, type: "auto" },
  gold: { cost: 2500, increase: 100, type: "auto" },
  chef: { cost: 10000, increase: 500, type: "auto" },
  chocolate: { cost: 15000, increase: 100, type: "click" },
  strawberry: { cost: 30000, increase: 250, type: "auto" },
  robot: { cost: 75000, increase: 1000, type: "auto" },
  rainbow: { cost: 150000, increase: 500, type: "click" },
  restaurant: { cost: 500000, increase: 5000, type: "auto" },
  galaxy: { cost: 2000000, increase: 20000, type: "auto" },
  wizard: { cost: 10000000, increase: 100000, type: "auto" },
  universe: { cost: 50000000, increase: 500000, type: "auto" }
};

const waffleDisplay = document.getElementById("waffles");
const waffleButton = document.getElementById("waffle");
const waffleImage = waffleButton.querySelector("img");
const perSecond = document.getElementById("perSecond");
const perClick = document.getElementById("perClick");

// transparent pixel checker
const pixelCanvas = document.createElement("canvas");
const pixelContext = pixelCanvas.getContext("2d", {
  willReadFrequently: true
});

let imageReady = false;

function prepareWaffleImage() {
  if (!waffleImage.complete || !waffleImage.naturalWidth) return;

  pixelCanvas.width = waffleImage.naturalWidth;
  pixelCanvas.height = waffleImage.naturalHeight;
  pixelContext.drawImage(waffleImage, 0, 0);
  imageReady = true;
}

waffleImage.addEventListener("load", prepareWaffleImage);
prepareWaffleImage();

function isVisiblePixel(event) {
  if (!imageReady) return false;

  const rect = waffleImage.getBoundingClientRect();

  const x = Math.floor(
    (event.clientX - rect.left) * pixelCanvas.width / rect.width
  );

  const y = Math.floor(
    (event.clientY - rect.top) * pixelCanvas.height / rect.height
  );

  if (
    x < 0 || y < 0 ||
    x >= pixelCanvas.width || y >= pixelCanvas.height
  ) {
    return false;
  }

  return pixelContext.getImageData(x, y, 1, 1).data[3] > 0;
}

// cursor
waffleImage.addEventListener("mousemove", (event) => {
  waffleImage.style.cursor = isVisiblePixel(event) ? "pointer" : "default";
});

waffleImage.addEventListener("mouseleave", () => {
  waffleImage.style.cursor = "default";
});

// counter animation
let displayedWaffles = 0;
let counterInterval = null;

function animateCounter() {
  if (!waffleDisplay || counterInterval !== null) return;

  counterInterval = setInterval(() => {
    const difference = waffles - displayedWaffles;

    if (difference === 0) {
      clearInterval(counterInterval);
      counterInterval = null;
      return;
    }

    const step = Math.max(1, Math.ceil(Math.abs(difference) * 0.15));
    displayedWaffles += Math.sign(difference) * step;
    waffleDisplay.textContent = Math.floor(displayedWaffles);
  }, 10);
}

// update everything
function update() {
  animateCounter();

  if (perClick) {
    perClick.textContent = clickPower + " waffles per click";
  }

  if (perSecond) {
    perSecond.textContent = autoPower + " waffles per second";
  }

  for (const name in upgrades) {
    const upgrade = upgrades[name];
    const costDisplay = document.getElementById(name + "Cost");
    const upgradeButton = document.getElementById(name + "Upgrade");

    if (costDisplay) costDisplay.textContent = upgrade.cost;
    if (upgradeButton) upgradeButton.disabled = waffles < upgrade.cost;
  }
}

// shrink while holding the mouse down
waffleImage.addEventListener("mousedown", (event) => {
  if (isVisiblePixel(event)) {
    waffleImage.classList.add("shrink");
  }
});

window.addEventListener("mouseup", () => {
  waffleImage.classList.remove("shrink");
});

waffleImage.addEventListener("mouseleave", () => {
  waffleImage.classList.remove("shrink");
});

// touch support
waffleImage.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (touch && isVisiblePixel(touch)) {
    waffleImage.classList.add("shrink");
  }
}, { passive: true });

window.addEventListener("touchend", () => {
  waffleImage.classList.remove("shrink");
});

// clicking the waffle
waffleButton.addEventListener("click", (event) => {
  if (!isVisiblePixel(event)) return;

  waffles += clickPower;
  update();
});

// buying upgrades
function buyUpgrade(name) {
  const upgrade = upgrades[name];

  if (!upgrade || waffles < upgrade.cost) return;

  waffles -= upgrade.cost;

  if (upgrade.type === "click") {
    clickPower += upgrade.increase;
  } else {
    autoPower += upgrade.increase;
  }

  upgrade.cost = Math.floor(upgrade.cost * 1.25);
  update();
}

for (const name in upgrades) {
  const button = document.getElementById(name + "Upgrade");

  if (button) {
    button.addEventListener("click", () => buyUpgrade(name));
  }
}

// automatic waffle production
setInterval(() => {
  waffles += autoPower;
  update();
}, 1000);

update();
