const gallery = document.querySelector("[data-gallery]");

if (gallery) {
  const frame = gallery.querySelector("[data-gallery-frame]");
  const image = gallery.querySelector("[data-gallery-image]");
  const buttons = Array.from(gallery.querySelectorAll("[data-image]"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.dataset.image;
      image.alt = button.dataset.alt;
      frame.classList.toggle("is-gameplay", button.dataset.fit === "gameplay");
      frame.classList.toggle("is-interface", button.dataset.fit === "interface");

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
    });
  });
}

const bannerStage = document.querySelector("[data-banner-stage]");

if (bannerStage) {
  const banners = [
    { src: "assets/banner-1.gif", duration: 6720 },
    { src: "assets/banner-2.gif", duration: 5820 },
    { src: "assets/banner-3.gif", duration: 12270 },
    { src: "assets/banner-4.gif", duration: 14910 },
  ];
  const layers = Array.from(bannerStage.querySelectorAll("[data-banner-layer]"));
  const perspectiveLabel = bannerStage.querySelector("[data-perspective-label]");
  const mobileBannerQuery = window.matchMedia("(max-width: 820px)");
  const desktopPerspectiveCycle = ["is-top", "is-bottom"];
  const mobilePerspectiveCycle = [
    "is-full",
    "is-top",
    "is-bottom",
    "is-full",
    "is-bottom",
    "is-top",
  ];
  const fadeMs = 1100;
  const signalMs = 560;
  const perspectiveNames = {
    "is-full": "Split view",
    "is-top": "Perspective A",
    "is-bottom": "Perspective B",
  };

  let currentLayer = 0;
  let currentBanner = randomIndex(banners.length);
  let cycleIndex = 0;
  let currentPerspective = randomPerspective(true);
  let perspectiveTimer;
  let bannerTimer;
  let signalTimer;

  layers[currentLayer].src = banners[currentBanner].src;
  setPerspective(layers[currentLayer], currentPerspective);
  schedulePerspectiveSwap();
  scheduleBannerSwap();

  function randomIndex(length) {
    return Math.floor(Math.random() * length);
  }

  function nextBannerIndex() {
    if (banners.length < 2) {
      return currentBanner;
    }

    let next = randomIndex(banners.length);
    while (next === currentBanner) {
      next = randomIndex(banners.length);
    }
    return next;
  }

  function activePerspectiveCycle() {
    return mobileBannerQuery.matches ? mobilePerspectiveCycle : desktopPerspectiveCycle;
  }

  function randomBetween(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  function setPerspective(layer, perspective) {
    layer.classList.toggle("is-top", perspective === "is-top");
    layer.classList.toggle("is-bottom", perspective === "is-bottom");
    layer.classList.toggle("is-full", perspective === "is-full");

    bannerStage.dataset.perspective = perspective.replace("is-", "");

    if (perspectiveLabel) {
      perspectiveLabel.textContent = perspectiveNames[perspective];
    }

    restartCameraDrift(layer);
  }

  function restartCameraDrift(layer) {
    layer.style.animation = "none";
    window.requestAnimationFrame(() => {
      layer.style.animation = "";
    });
  }

  function randomPerspective(allowFull) {
    const cycle = allowFull ? activePerspectiveCycle() : desktopPerspectiveCycle;
    cycleIndex = randomIndex(cycle.length);
    return cycle[cycleIndex];
  }

  function nextPerspective() {
    const cycle = activePerspectiveCycle();
    const currentIndex = cycle.indexOf(currentPerspective);
    cycleIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % cycle.length;
    return cycle[cycleIndex];
  }

  function perspectiveDelay() {
    if (!mobileBannerQuery.matches) {
      return randomBetween(2800, 3900);
    }

    return currentPerspective === "is-full"
      ? randomBetween(1900, 2450)
      : randomBetween(3100, 4100);
  }

  function triggerSignalDrop() {
    window.clearTimeout(signalTimer);
    bannerStage.classList.add("is-switching");
    signalTimer = window.setTimeout(() => {
      bannerStage.classList.remove("is-switching");
    }, signalMs);
  }

  function swapPerspective() {
    triggerSignalDrop();
    currentPerspective = nextPerspective();
    window.setTimeout(() => {
      setPerspective(layers[currentLayer], currentPerspective);
    }, 90);
    schedulePerspectiveSwap();
  }

  function schedulePerspectiveSwap() {
    window.clearTimeout(perspectiveTimer);
    perspectiveTimer = window.setTimeout(swapPerspective, perspectiveDelay());
  }

  function scheduleBannerSwap() {
    window.clearTimeout(bannerTimer);
    const duration = Math.max(banners[currentBanner].duration - fadeMs, fadeMs);
    bannerTimer = window.setTimeout(swapBanner, duration);
  }

  function swapBanner() {
    const nextLayer = currentLayer === 0 ? 1 : 0;
    const nextBanner = nextBannerIndex();

    triggerSignalDrop();
    currentPerspective = randomPerspective(true);
    layers[nextLayer].src = banners[nextBanner].src;
    setPerspective(layers[nextLayer], currentPerspective);

    layers[nextLayer].classList.add("is-visible");
    layers[currentLayer].classList.remove("is-visible");

    currentLayer = nextLayer;
    currentBanner = nextBanner;
    schedulePerspectiveSwap();
    scheduleBannerSwap();
  }
}
