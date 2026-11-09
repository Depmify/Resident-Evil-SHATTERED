"use strict";

/* ------------------------------------------------------------------ whole-pixel scale
   The page is authored in RE1.5 pixels. Pick the number of DEVICE pixels per
   RE1.5 pixel (1.5 at 1080p, 2 at 1440p, 3 at 2160p) and convert it to CSS zoom,
   so Windows display scaling (125 %, 150 %) does not change the size. 1080p uses
   1.5 by choice (smaller page, slightly softer pixel edges); the others are whole
   numbers and stay pixel-exact. */
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
    : deviceWidth >= 3400 ? 3 : deviceWidth >= 2400 ? 2 : 1.5;
  const zoom = scale / dpr;
  root.style.zoom = zoom;
  const logicalW = cssWidth / zoom;
  root.classList.toggle("is-narrow", logicalW < 700);
  root.classList.toggle("is-compact", logicalW < 820);
  root.classList.toggle("is-mid", logicalW < 900);
  // The pointer: one cursor pixel per device pixel up to 1440p, two at 2160p.
  const c = Math.max(1, Math.floor(deviceWidth / 1920));
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

/* ------------------------------------------------------------------ live data: GitHub releases + CHANGELOG.md
   Version, release date and download count come from the GitHub releases API.
   What's New reads CHANGELOG.md; a published release that CHANGELOG.md does not
   have yet is read from the release text itself, so publishing a release on GitHub
   is enough (the changelog workflow then adds it to CHANGELOG.md). */
const REPO = "Depmify/Resident-Evil-SHATTERED";
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=100`;
const CHANGELOG_URL = `https://raw.githubusercontent.com/${REPO}/main/CHANGELOG.md`;
const releaseStats = {}; // tag -> { date, downloads, url }
let RELEASES = [];

const fmtCount = (n) => n.toLocaleString("en-US");

function cached(key, maxAgeMs) {
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || "null");
    return hit && Date.now() - hit.at < maxAgeMs ? hit.data : null;
  } catch { return null; }
}

function remember(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch { /* storage unavailable */ }
}

async function fetchReleases() {
  let list = cached("shattered-releases-v2", 10 * 60 * 1000);
  if (!list) {
    const response = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub releases: ${response.status}`);
    list = (await response.json())
      .filter((r) => !r.draft && !r.prerelease)
      .map((r) => ({
        tag: r.tag_name,
        name: r.name || "",
        body: r.body || "",
        date: (r.published_at || r.created_at).slice(0, 10),
        downloads: r.assets.reduce((sum, a) => sum + a.download_count, 0),
        url: r.html_url,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    remember("shattered-releases-v2", list);
  }
  return list;
}

function showLatest(latest) {
  if (!latest) return;
  document.querySelectorAll("[data-release-version]").forEach((el) => { el.textContent = latest.tag; });
  document.querySelectorAll("[data-release-link]").forEach((el) => { el.href = latest.url; });
  document.querySelectorAll("[data-release-date]").forEach((el) => { el.textContent = latest.date; });
  document.querySelectorAll("[data-release-downloads]").forEach((el) => { el.textContent = fmtCount(latest.downloads); });
}

// CHANGELOG.md: "## vX.Y.Z — Title", a summary paragraph, then "### ..." sections.
// Bullets under a "Fixes" heading are fixes, under "What's New"/"What's Changed" are
// new; anything else (other headings, paragraphs after a list) becomes a note.
const NEW_ICONS = ["handgun", "shotgun", "magnum", "knife", "spray2"];

function plain(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseChangelog(md) {
  const releases = [];
  let current = null;
  let kind = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("```")) continue;
    const release = /^##\s+(v[\w.\-]+)\s*(?:[—–-]+\s*(.*))?$/.exec(line);
    if (release) {
      current = { v: release[1], title: plain(release[2] || ""), summary: "", items: [] };
      releases.push(current);
      kind = null;
      continue;
    }
    if (!current || /^#\s/.test(line)) continue;
    const heading = /^###\s+(.*)$/.exec(line);
    if (heading) {
      kind = /fix/i.test(heading[1]) ? "fix" : /new|changed|added/i.test(heading[1]) ? "new" : "note";
      continue;
    }
    const bullet = /^[-*+]\s+(.*)$/.exec(line) || /^\d+\.\s+(.*)$/.exec(line);
    if (bullet) {
      current.items.push([kind || "new", plain(bullet[1])]);
    } else if (!kind && !current.summary) {
      current.summary = plain(line);
    } else if (/^[A-Za-z]/.test(line)) {
      current.items.push(["note", plain(line)]);
    }
  }
  releases.forEach((r) => {
    let n = 0;
    r.items = r.items.map(([k, text]) => [k, k === "fix" ? "spray" : k === "note" ? "knife" : NEW_ICONS[n++ % NEW_ICONS.length], text]);
  });
  return releases.filter((r) => r.items.length);
}

async function fetchChangelog() {
  let md = cached("shattered-changelog", 10 * 60 * 1000);
  if (!md) {
    const response = await fetch(CHANGELOG_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`CHANGELOG.md: ${response.status}`);
    md = await response.text();
    remember("shattered-changelog", md);
  }
  return md;
}

// A release's own text in the CHANGELOG shape. The release name may carry a subtitle
// after a dash ("RESIDENT EVIL: SHATTERED v0.1.9 — Voice Chat"). The Installation and
// Experimental sections and embedded images are left out, as in CHANGELOG.md
// (.github/scripts/add_release_to_changelog.py applies the same rules).
function releaseNotes(r) {
  const subtitle = (/\s[—–-]\s(.+)$/.exec(r.name.replace(/^.*?\bv\d[\w.]*/, "")) || [])[1] || "";
  const kept = [];
  let skip = false;
  for (const line of r.body.split(/\r?\n/)) {
    if (/^#{2,3}\s/.test(line)) skip = /installation|experimental/i.test(line);
    if (!skip && !/^\s*</.test(line)) kept.push(line);
  }
  return `## ${r.tag}${subtitle ? ` — ${subtitle}` : ""}\n\n${kept.join("\n")}`;
}

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
let release = null;
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

function renderStats() {
  if (!release) return;
  const stats = releaseStats[release.v];
  document.querySelector("[data-news-date]").textContent = stats ? stats.date : "---";
  document.querySelector("[data-news-downloads]").textContent = stats ? fmtCount(stats.downloads) : "---";
  newsLink.href = stats ? stats.url : `https://github.com/${REPO}/releases`;
}

function renderNews() {
  if (!release) return;
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
  document.querySelector("[data-news-new]").textContent = String(n);
  document.querySelector("[data-news-fix]").textContent = String(f);
  newsSummary.textContent = release.summary;
  renderStats();
  const first = newsList.querySelector("button");
  if (first) selectItem(first, items[0][0], items[0][1]);
  else { newsTitle.textContent = release.v; newsSub.textContent = release.title; newsText.textContent = "Nothing in this category."; }
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

function buildVersionList() {
  versionList.textContent = "";
  RELEASES.forEach((r) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span></span><span class="muted"></span>`;
    b.firstChild.textContent = r.v;
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
}

versionDrop.querySelector(".field").addEventListener("click", (e) => {
  e.stopPropagation();
  const open = !versionDrop.classList.contains("is-open");
  closeMenus();
  closeDropdowns();
  versionDrop.classList.toggle("is-open", open);
  e.currentTarget.setAttribute("aria-expanded", String(open));
  se(open ? "confirm" : "cancel");
});

Promise.allSettled([fetchReleases(), fetchChangelog()]).then(([published, changelog]) => {
  const releases = published.status === "fulfilled" ? published.value : [];
  const logged = changelog.status === "fulfilled" ? parseChangelog(changelog.value) : [];
  releases.forEach((r) => { releaseStats[r.tag] = r; });
  showLatest(releases[0]); // without the API the page keeps the version and date it was written with

  // Releases newer than everything in CHANGELOG.md come from their own text.
  const inLog = new Set(logged.map((r) => r.v));
  const newestLogged = releases.filter((r) => inLog.has(r.tag)).map((r) => r.date).sort().pop() || "";
  const fresh = releases
    .filter((r) => !inLog.has(r.tag) && r.date > newestLogged)
    .map((r) => parseChangelog(releaseNotes(r))[0])
    .filter(Boolean);

  RELEASES = [...fresh, ...logged];
  release = RELEASES[0] || null;
  if (!release) {
    newsTitle.textContent = "Changelog";
    newsSub.textContent = "";
    newsText.textContent = "The changelog could not be loaded right now. Use FULL CHANGELOG to read it on GitHub.";
    return;
  }
  versionDrop.querySelector("[data-dropdown-value]").textContent = release.v;
  buildVersionList();
  renderNews();
});

/* ------------------------------------------------------------------ media viewer */
const gallery = document.querySelector("[data-gallery]");
const thumbs = Array.from(gallery.querySelectorAll("[data-image]"));
const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));
const slideMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let shot = 0;
let front = 0;
let slideTimer = 0;
let slideToken = 0;

// Two stacked images: the next picture loads behind and fades in over the current one.
function showSlide(src, alt) {
  const token = ++slideToken;
  const back = slides[1 - front];
  const swap = () => {
    back.onload = back.onerror = null;
    if (token !== slideToken) return;
    back.alt = alt;
    back.removeAttribute("aria-hidden");
    slides[front].classList.remove("is-on");
    slides[front].setAttribute("aria-hidden", "true");
    slides[front].alt = "";
    back.classList.add("is-on");
    front = 1 - front;
  };
  if (slides[front].getAttribute("src") === src) return; // already showing it
  back.onload = back.onerror = swap;
  back.src = src;
  if (back.complete && back.naturalWidth) swap();
}

function showShot(i) {
  shot = (i + thumbs.length) % thumbs.length;
  const t = thumbs[shot];
  const pictures = t.dataset.image.split("|");
  let picture = 0;
  clearInterval(slideTimer);
  showSlide(pictures[0], t.dataset.alt);
  if (pictures.length > 1 && !slideMotion.matches) {
    slideTimer = setInterval(() => {
      picture = (picture + 1) % pictures.length;
      showSlide(pictures[picture], t.dataset.alt);
    }, Number(t.dataset.interval) || 5000);
  }
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
