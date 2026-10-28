// Per-site: where the pill goes, where the site's own caption text is, what to hide, and its default text size.
const SITES = {
  youtube: {
    player: '#movie_player',
    text: '.ytp-caption-segment',
    hide: '.ytp-caption-window-container',
    timed: true, // read real caption timing from YouTube's caption data when it can be found
    base: (player) => player.clientWidth * 0.012,
  },
  // Udemy's class names are hashed, so use data-purpose and find the player as the closest box holding both video and caption.
  udemy: {
    mirror: true, // follow Udemy's own caption menu (font size, background opacity, display under video)
    player: () => {
      const v = document.querySelector('video');
      const c = document.querySelector('[data-purpose="captions-cue-text"]');
      let a = v;
      while (a && c && !a.contains(c)) a = a.parentElement;
      return a || v?.parentElement;
    },
    text: '[data-purpose="captions-cue-text"]',
    hide: '[data-purpose="captions-cue-text"], [class*="captions-display-module--captions-container"]',
    base: (player, el) => (el ? parseFloat(getComputedStyle(el).fontSize) * 0.5 : player.clientWidth * 0.012),
  },
};
const host = location.hostname;
const site = (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) ? SITES.youtube : SITES.udemy;

const DEFAULTS = { enabled: true, size: 100, opacity: 20, bg: '#1e1e1e', color: '#ffffff' };
let cfg = { ...DEFAULTS };
let under = false; // Udemy's "Display under video" is on: leave its own captions alone

// Loaded from JS so the same file works in Chrome, Edge and Firefox (their extension URLs differ).
new FontFace('SoftOutfit', `url(${chrome.runtime.getURL('Outfit.ttf')})`, { weight: '100 900' })
  .load()
  .then((f) => document.fonts.add(f))
  .catch(() => {});

const box = document.createElement('div');
box.id = 'soft-caption';
box.hidden = true;
const hideStyle = document.createElement('style');
document.documentElement.appendChild(hideStyle);

function applyStyle() {
  hideStyle.textContent = cfg.enabled && !under ? `${site.hide}{opacity:0!important;pointer-events:none}` : '';
  box.style.setProperty('--sc-bg', `color-mix(in srgb, ${cfg.bg} ${cfg.opacity}%, transparent)`);
  box.style.setProperty('--sc-color', cfg.color);
  schedule();
}

// Opacity of the first non-transparent background at or above el (Udemy's caption menu sets it).
function bgAlpha(el) {
  for (let i = 0; el && i < 4; i++, el = el.parentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!m) continue;
    const p = m[1].split(/[ ,/]+/).filter(Boolean);
    const a = p.length > 3 ? parseFloat(p[3]) : 1;
    if (a > 0) return a;
  }
}

// YouTube: find the caption file the player itself loaded, re-read it as json3, and show cues by video time.
let cues = null;
let cuesUrl = '';
let cuesVideo = '';
const videoId = () => new URLSearchParams(location.search).get('v') || location.pathname.split('/').pop();

async function loadCues(url, id) {
  try {
    const u = new URL(url);
    u.searchParams.set('fmt', 'json3');
    u.searchParams.set('sc', '1'); // marks our own request so we skip it below
    const data = await (await fetch(u)).json();
    if (id !== videoId()) return;
    cues = buildCues(data.events || [], u.searchParams.get('kind') === 'asr');
    cuesVideo = id;
    if (!looping) loop();
  } catch {
    cues = null; // falls back to reading the page's caption text
  }
}

function syncTrack(names) {
  const id = videoId();
  for (let i = names.length - 1; i >= 0; i--) {
    const n = names[i];
    if (!n.includes('/api/timedtext') || n.includes('sc=1')) continue;
    try {
      if (new URL(n).searchParams.get('v') !== id) continue;
    } catch { continue; }
    if (n !== cuesUrl) { cuesUrl = n; loadCues(n, id); }
    return;
  }
}

if (site.timed) {
  // shortcut: needs the page's own caption request to appear in the performance log; if it does not, the page-text fallback is used
  new PerformanceObserver((list) => syncTrack(list.getEntries().map((e) => e.name))).observe({ type: 'resource', buffered: true });
}

let looping = false;
function loop() {
  looping = true;
  update();
  if (cues) requestAnimationFrame(loop);
  else looping = false;
}

let queued = false;
function schedule() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(update);
  }
}

function update() {
  queued = false;
  const player = typeof site.player === 'function' ? site.player() : document.querySelector(site.player);
  if (!player) return;
  if (!cfg.enabled) { box.hidden = true; return; }
  if (box.parentNode !== player) {
    if (getComputedStyle(player).position === 'static') player.style.position = 'relative'; // the pill is positioned inside it
    player.appendChild(box);
  }
  // The site's own caption stays in the DOM (hidden by CSS); we only read its text.
  let text;
  const video = player.querySelector('video');
  if (cues && cuesVideo === videoId() && video) {
    const ccOn = player.querySelector('.ytp-subtitles-button')?.getAttribute('aria-pressed') === 'true';
    text = ccOn && !player.classList.contains('ad-showing') ? cueAt(cues, video.currentTime * 1000) : '';
  } else {
    // A Set drops lines the site renders twice (e.g. two caption windows holding the same cue).
    const parts = new Set([...player.querySelectorAll(site.text)].map((s) => s.textContent.trim()).filter(Boolean));
    text = [...parts].join(' ').split(/\s+/).join(' ');
  }
  if (box.textContent !== text) box.textContent = text;
  box.hidden = !text;

  const el = document.querySelector(site.text);
  box.style.fontSize = site.base(player, el) * (cfg.size / 100) + 'px';

  if (site.mirror) {
    if (el && video) {
      const now = el.getBoundingClientRect().top >= video.getBoundingClientRect().bottom - 2;
      if (now !== under) { under = now; applyStyle(); }
      const a = bgAlpha(el);
      if (a) box.style.setProperty('--sc-bg', `color-mix(in srgb, ${cfg.bg} ${Math.round(a * cfg.opacity)}%, transparent)`);
    }
    if (under) box.hidden = true;
  }
}

// shortcut: observes the whole page, fine for one cheap rAF-throttled callback; narrow it if a site gets slow
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

chrome.storage.local.get(DEFAULTS, (v) => {
  cfg = v;
  applyStyle();
});
chrome.storage.onChanged.addListener((changes) => {
  for (const k in changes) cfg[k] = changes[k].newValue;
  applyStyle();
});
