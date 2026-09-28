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

const heroVideo = document.querySelector("[data-hero-video]");

if (heroVideo) {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncHeroVideoMotion = () => {
    if (reducedMotionQuery.matches) {
      heroVideo.pause();
      return;
    }

    heroVideo.play().catch(() => {});
  };

  syncHeroVideoMotion();
  reducedMotionQuery.addEventListener("change", syncHeroVideoMotion);
}
