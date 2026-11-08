"use strict";

/* ------------------------------------------------------------------ whole-pixel scale
   The page is authored in RE1.5 pixels. Pick a whole number of DEVICE pixels per
   RE1.5 pixel (2 at 1080p, 3 at 1440p, 4 at 2160p) and convert it to CSS zoom, so
   Windows display scaling (125 %, 150 %) cannot blur the fonts. */
const root = document.documentElement;
let scale = 2;

function applyScale() {
  const dpr = window.devicePixelRatio || 1;
  // Measure unzoomed. clientWidth, not innerWidth: on phones innerWidth grows with any overflow.
  root.style.zoom = "";
  const cssWidth = root.clientWidth || window.innerWidth;
  const deviceWidth = cssWidth * dpr;
  // Phones and small windows: the largest whole scale that still leaves ~250 pixels of width.
  scale = cssWidth < 800 ? Math.max(1, Math.floor(deviceWidth / 250))
    : deviceWidth >= 3400 ? 4 : deviceWidth >= 2400 ? 3 : 2;
  const zoom = scale / dpr;
  root.style.zoom = zoom;
  const logicalW = cssWidth / zoom;
  root.classList.toggle("is-narrow", logicalW < 700);
  root.classList.toggle("is-compact", logicalW < 820);
  root.classList.toggle("is-mid", logicalW < 900);
  const c = Math.min(scale, 4);
  root.style.setProperty("--cur-arrow", `url(kit/cursor-arrow-x${c}.png) 0 0, auto`);
  root.style.setProperty("--cur-hand", `url(kit/cursor-hand-x${c}.png) ${4 * c} 0, pointer`);
  root.style.setProperty("--cur-text", `url(kit/cursor-ibeam-x${c}.png) ${4 * c} ${7 * c}, text`);
  root.dataset.scale = `x${scale}`;
}

applyScale();
window.addEventListener("resize", applyScale);

/* ------------------------------------------------------------------ sound (RE1.5 inventory SEs, off by default) */
const sounds = { cursor: "kit/INVENTORY_CURSOR.WAV", confirm: "kit/INVENTORY_CONFIRM.WAV", cancel: "kit/INVENTORY_CANCEL.WAV" };
let soundOn = false;
const soundCache = {};

function se(name) {
  if (!soundOn) return;
  const a = soundCache[name] || (soundCache[name] = new Audio(sounds[name]));
  a.volume = 0.35;
  a.currentTime = 0;
  a.play().catch(() => {});
}

const soundToggle = document.querySelector("[data-sound]");
soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "SE ON" : "SE OFF";
  soundToggle.classList.toggle("is-on", soundOn);
  soundToggle.setAttribute("aria-pressed", String(soundOn));
  se("confirm");
});

/* ------------------------------------------------------------------ menus */
const menus = Array.from(document.querySelectorAll("[data-menu]"));

function closeMenus(except) {
  menus.forEach((m) => {
    if (m === except) return;
    m.classList.remove("is-open");
    m.querySelector(".menu-title").setAttribute("aria-expanded", "false");
  });
}

menus.forEach((menu) => {
  const title = menu.querySelector(".menu-title");
  title.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !menu.classList.contains("is-open");
    closeMenus(menu);
    menu.classList.toggle("is-open", open);
    title.setAttribute("aria-expanded", String(open));
    se(open ? "confirm" : "cancel");
  });
  // Like a desktop menu bar: once one menu is open, hovering another switches to it.
  menu.addEventListener("mouseenter", () => {
    if (menus.some((m) => m.classList.contains("is-open")) && !menu.classList.contains("is-open")) {
      closeMenus(menu);
      menu.classList.add("is-open");
      se("cursor");
    }
  });
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("mouseenter", () => se("cursor"));
    a.addEventListener("click", () => { se("confirm"); closeMenus(); });
  });
});

document.addEventListener("click", () => { closeMenus(); closeDropdowns(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeMenus(); closeDropdowns(); se("cancel"); }
});

/* ------------------------------------------------------------------ changelog data (from CHANGELOG.md) */
const RELEASES = [
  {
    v: "v0.1.8", date: "2026-11-01", title: "Classic Mode, New Inventory Style & Smoother Co-op",
    summary: "Classic Mode, a Silent Hill 4-style inventory, new zombies and a more dangerous Mr. X. Online play feels more responsive.",
    items: [
      ["new", "handgun", "Play Classic Mode, built on the original game's rules."],
      ["new", "spray", "Choose a new Silent Hill 4 inventory style. In co-op, each player picks their own."],
      ["new", "magnum", "Turn on analog movement, set separately for each player."],
      ["new", "shotgun", "Face Mr. X with new movement and attacks."],
      ["new", "knife", "Meet new zombie appearances, including female researchers."],
      ["new", "spray2", "Turn on soft shadows in the options."],
      ["new", "handgun", "Visit the new Credits screen from the main menu."],
      ["new", "magnum", "Enjoy more responsive movement when joining someone else's game."],
      ["fix", "spray", "See where every player is on the map, even with four players."],
      ["fix", "spray", "Read every page of a File together in co-op."],
      ["fix", "spray", "Start a round even when players have different mods installed."],
      ["fix", "spray", "Your shots now connect properly with Nemesis."],
      ["fix", "spray", "Fewer situations where a Tyrant leaves you frozen in place."],
      ["fix", "spray", "The opening with Barry and the first zombie now plays out correctly in single player."],
      ["fix", "spray", "Fewer crashes during movies and door transitions."],
    ],
  },
  {
    v: "v0.1.7", date: "2026-10-22", title: "Any PC Version & Up to Four Players Online",
    summary: "Every existing PC release of Resident Evil 1, including GOG, Steam and Sourcenext. Online sessions hold up to four players.",
    items: [
      ["new", "handgun", "Play with your GOG, Steam, or Sourcenext copy. Essentially any existing PC version works: select it in the launcher."],
      ["new", "shotgun", "Play online with up to four players."],
      ["new", "magnum", "Use improved mod features."],
      ["note", "knife", "Three or four players are experimental: the campaign reaches the laboratories but cannot be completed yet."],
      ["fix", "spray", "Various fixes."],
    ],
  },
  {
    v: "v0.1.6", date: "2026-10-17", title: "Harassment Difficulty & Multiplayer Improvements",
    summary: "A new Story Mode difficulty, new threats, and a better multiplayer and mod experience.",
    items: [
      ["new", "knife", "Take on Story Mode's new Harassment difficulty."],
      ["new", "shotgun", "Find the Benelli in Richard's room."],
      ["new", "magnum", "Encounter new appearances from Mr. X and Nemesis."],
      ["new", "handgun", "Use improved support for compatible mods."],
      ["new", "spray2", "Navigate the multiplayer menus more easily."],
      ["fix", "spray", "Fixes for several multiplayer issues."],
    ],
  },
  {
    v: "v0.1.5", date: "2026-10-14", title: "Complete Online Co-op, Mods & New Combat",
    summary: "Online co-op for the complete campaign, compatible mods, and enemies and weapons inspired by RE2 and RE3.",
    items: [
      ["new", "handgun", "Play through the complete campaign online with a friend, from the opening to the ending."],
      ["new", "spray2", "Use compatible mods with SHATTERED."],
      ["new", "knife", "Face Resident Evil 2 zombies, replacing the original Resident Evil 1 zombies."],
      ["new", "shotgun", "Use weapons from Resident Evil 3, including the Western Custom, Benelli M3, and Eagle."],
      ["new", "magnum", "Evade enemy attacks with the Resident Evil 3 dodge."],
      ["new", "handgun", "Unlock a special skin by completing the game for the first time."],
      ["fix", "spray", "Numerous bug fixes and gameplay improvements."],
    ],
  },
  {
    v: "v0.1.0", date: "2026-10-05", title: "Jill's Story, From Start to Finish",
    summary: "Jill's campaign from the Spencer Mansion through its ending, with more of the story playable in SplitScreen.",
    items: [
      ["new", "handgun", "Play through Jill's story from beginning to end, including the later areas and the finale."],
      ["new", "spray2", "Experience selected cutscenes and story moments together in cooperative SplitScreen."],
      ["new", "shotgun", "Continue further together, with better co-op encounters, puzzles, interactions and progression."],
      ["new", "magnum", "Feel gameplay through controller vibration."],
      ["new", "knife", "Improved movement and controller response in exploration and combat."],
      ["new", "handgun", "A refreshed main menu and an updated launcher."],
      ["note", "spray", "Native online and LAN were disabled in this release; SplitScreen was the co-op mode."],
    ],
  },
];

/* ------------------------------------------------------------------ what's new: item list + description */
const newsList = document.querySelector("[data-news-list]");
const newsTitle = document.querySelector("[data-news-title]");
const newsSub = document.querySelector("[data-news-sub]");
const newsText = document.querySelector("[data-news-text]");
const newsSummary = document.querySelector("[data-news-summary]");
const newsIcon = document.querySelector("[data-news-icon]");
const newsLink = document.querySelector("[data-news-link]");
const newsCount = document.querySelector("[data-news-count]");
const TAGS = { new: ["NEW", "chip"], fix: ["FIX", "chip chip-ink"], note: ["NOTE", "chip chip-orange"] };
let release = RELEASES[0];
let filter = "all";
let typeTimer = 0;

function typewrite(el, text) {
  clearInterval(typeTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = text; return; }
  let i = 0;
  el.textContent = "";
  typeTimer = setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i >= text.length) clearInterval(typeTimer);
  }, 16);
}

function selectItem(button, item, index) {
  newsList.querySelectorAll("button").forEach((b) => b.classList.toggle("is-sel", b === button));
  newsIcon.style.backgroundImage = `url(kit/icon-${item[1]}.png)`;
  newsTitle.textContent = `${release.v}  ${TAGS[item[0]][0]} ${String(index + 1).padStart(2, "0")}`;
  newsSub.textContent = release.title;
  typewrite(newsText, item[2]);
}

function renderNews() {
  newsList.textContent = "";
  const items = release.items.map((it, i) => [it, i]).filter(([it]) => filter === "all" || it[0] === filter);
  items.forEach(([item, index]) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span class="n">${String(index + 1).padStart(2, "0")}</span><span class="tag ${TAGS[item[0]][1]}">${TAGS[item[0]][0]}</span><span></span>`;
    b.lastChild.textContent = item[2];
    b.addEventListener("click", () => { selectItem(b, item, index); se("confirm"); });
    b.addEventListener("mouseenter", () => se("cursor"));
    li.append(b);
    newsList.append(li);
  });
  const n = release.items.filter((i) => i[0] === "new").length;
  const f = release.items.filter((i) => i[0] === "fix").length;
  newsCount.textContent = `${n} NEW  ${f} FIX`;
  document.querySelector("[data-news-date]").textContent = release.date;
  document.querySelector("[data-news-new]").textContent = String(n);
  document.querySelector("[data-news-fix]").textContent = String(f);
  newsSummary.textContent = release.summary;
  newsLink.href = `https://github.com/Depmify/Resident-Evil-SHATTERED/releases/tag/${release.v}`;
  const first = newsList.querySelector("button");
  if (first) selectItem(first, items[0][0], items[0][1]);
}

document.querySelectorAll("[data-news-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    filter = chip.dataset.newsFilter;
    document.querySelectorAll("[data-news-filter]").forEach((c) => c.classList.toggle("is-on", c === chip));
    renderNews();
    se("cursor");
  });
});

/* ------------------------------------------------------------------ drop-downs */
const dropdowns = Array.from(document.querySelectorAll("[data-dropdown]"));
function closeDropdowns() {
  dropdowns.forEach((d) => { d.classList.remove("is-open"); d.querySelector(".field").setAttribute("aria-expanded", "false"); });
}

const versionDrop = document.querySelector('[data-dropdown="version"]');
const versionList = versionDrop.querySelector(".dropdown-list");
RELEASES.forEach((r) => {
  const b = document.createElement("button");
  b.type = "button";
  b.innerHTML = `<span>${r.v}</span><span class="muted"></span>`;
  b.lastChild.textContent = r.title.split(/[,&]/)[0].trim();
  b.classList.toggle("is-sel", r === release);
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    release = r;
    versionDrop.querySelector("[data-dropdown-value]").textContent = r.v;
    versionList.querySelectorAll("button").forEach((x) => x.classList.toggle("is-sel", x === b));
    closeDropdowns();
    renderNews();
    se("confirm");
  });
  b.addEventListener("mouseenter", () => se("cursor"));
  versionList.append(b);
});
versionDrop.querySelector(".field").addEventListener("click", (e) => {
  e.stopPropagation();
  const open = !versionDrop.classList.contains("is-open");
  closeMenus();
  closeDropdowns();
  versionDrop.classList.toggle("is-open", open);
  e.currentTarget.setAttribute("aria-expanded", String(open));
  se(open ? "confirm" : "cancel");
});

renderNews();

/* ------------------------------------------------------------------ media viewer */
const gallery = document.querySelector("[data-gallery]");
const thumbs = Array.from(gallery.querySelectorAll("[data-image]"));
const galleryImage = gallery.querySelector("[data-gallery-image]");
let shot = 0;

function showShot(i) {
  shot = (i + thumbs.length) % thumbs.length;
  const t = thumbs[shot];
  galleryImage.src = t.dataset.image;
  galleryImage.alt = t.dataset.alt;
  gallery.querySelector("[data-gallery-title]").textContent = t.dataset.title;
  gallery.querySelector("[data-gallery-caption]").textContent = t.dataset.caption;
  gallery.querySelector("[data-gallery-count]").textContent = `${shot + 1} / ${thumbs.length}`;
  thumbs.forEach((x, j) => x.classList.toggle("is-active", j === shot));
}

thumbs.forEach((t, i) => t.addEventListener("click", () => { showShot(i); se("confirm"); }));
gallery.querySelector("[data-gallery-prev]").addEventListener("click", () => { showShot(shot - 1); se("cursor"); });
gallery.querySelector("[data-gallery-next]").addEventListener("click", () => { showShot(shot + 1); se("cursor"); });

/* ------------------------------------------------------------------ File pages */
const file = document.querySelector("[data-file]");
const pages = Array.from(file.querySelectorAll(".file-pages .message"));
let page = 0;
function showPage(i) {
  page = (i + pages.length) % pages.length;
  pages.forEach((p, j) => p.classList.toggle("is-on", j === page));
  file.querySelector("[data-file-page]").textContent = `${page + 1} / ${pages.length}`;
}
file.querySelector("[data-file-prev]").addEventListener("click", () => { showPage(page - 1); se("cursor"); });
file.querySelector("[data-file-next]").addEventListener("click", () => { showPage(page + 1); se("cursor"); });

/* ------------------------------------------------------------------ keyboard: arrows drive whatever is on screen */
function onScreen(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.3;
}

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
  if (!dir) return;
  if (onScreen(gallery)) { showShot(shot + dir); se("cursor"); e.preventDefault(); }
  else if (onScreen(file)) { showPage(page + dir); se("cursor"); e.preventDefault(); }
});

/* ------------------------------------------------------------------ video */
const heroVideo = document.querySelector("[data-hero-video]");
const videoToggle = document.querySelector("[data-video-toggle]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
function syncVideo() {
  if (reduced.matches) heroVideo.pause(); else heroVideo.play().catch(() => {});
}
videoToggle.addEventListener("click", () => {
  if (heroVideo.paused) heroVideo.play().catch(() => {}); else heroVideo.pause();
  se("confirm");
});
heroVideo.addEventListener("play", () => { videoToggle.textContent = "PAUSE"; });
heroVideo.addEventListener("pause", () => { videoToggle.textContent = "PLAY"; });
syncVideo();
reduced.addEventListener("change", syncVideo);

/* ------------------------------------------------------------------ scroll spy: menu bar + status bar */
const statusSection = document.querySelector("[data-status-section]");
const spyLinks = Array.from(document.querySelectorAll("[data-spy]"));
const sections = ["news", "modes", "media", "setup", "why", "community"].map((id) => document.getElementById(id));
const NAMES = { news: "WHAT'S NEW", modes: "MODES", media: "MEDIA", setup: "SETUP", why: "WHY", community: "COMMUNITY" };

function spy() {
  let current = "";
  sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.45) current = s.id; });
  spyLinks.forEach((a) => a.classList.toggle("is-current", a.dataset.spy === current));
  statusSection.textContent = current ? NAMES[current] : "TOP";
}
window.addEventListener("scroll", spy, { passive: true });
spy();

// The pixel fonts change line heights once loaded: re-land on the linked section.
document.fonts.ready.then(() => {
  const target = location.hash && document.querySelector(location.hash);
  if (target) target.scrollIntoView({ behavior: "instant" });
  spy();
});
