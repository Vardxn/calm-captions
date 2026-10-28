// Per-site: where to put the pill, where the site's own caption text is, and what to hide.
const SITES = {
  'www.youtube.com': {
    player: '#movie_player',
    text: '.ytp-caption-segment',
    hide: '.ytp-caption-window-container',
  },
  // Udemy's class names are hashed, so use data-purpose and find the player as the closest box holding both video and caption.
  udemy: {
    native: true, // keep Udemy's own caption timing and length; only restyle
    player: () => {
      const v = document.querySelector('video');
      const c = document.querySelector('[data-purpose="captions-cue-text"]');
      let a = v;
      while (a && c && !a.contains(c)) a = a.parentElement;
      return a || v?.parentElement;
    },
    text: '[data-purpose="captions-cue-text"]',
    hide: '[data-purpose="captions-cue-text"], [class*="captions-display-module--captions-container"]',
  },
};
const site = ((location.hostname.endsWith('youtube.com') || location.hostname.endsWith('youtube-nocookie.com')) && SITES['www.youtube.com']) || (location.hostname.endsWith('udemy.com') && SITES.udemy);

const DEFAULTS = { enabled: true, group: false, words: 6, size: 2.4, opacity: 72, bg: '#555555', color: '#ffffff', radius: 45, bottom: 13, font: 'outfit' };
let cfg = { ...DEFAULTS };

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
  hideStyle.textContent = cfg.enabled ? `${site.hide}{opacity:0!important;pointer-events:none}` : '';
  const s = box.style;
  s.setProperty('--sc-bg', `color-mix(in srgb, ${cfg.bg} ${cfg.opacity}%, transparent)`);
  s.setProperty('--sc-color', cfg.color);
  s.setProperty('--sc-radius', cfg.radius / 100 + 'em');
  s.setProperty('--sc-bottom', cfg.bottom + '%');
  s.setProperty('--sc-font', cfg.font === 'outfit' ? '"SoftOutfit"' : 'system-ui');
  schedule();
}

let queued = false;
const PAUSE = 450; // ms of silence that ends a group
let prev = []; // words the site showed on the previous update
let group = []; // words of the group being collected
let shown = '';
let pauseT = 0;
let hideT = 0;

function clearAll() {
  prev = [];
  group = [];
  shown = '';
  clearTimeout(pauseT);
  clearTimeout(hideT);
}

// A group is done: show it and keep it still until the next group is done.
function complete() {
  if (!group.length) return;
  shown = group.join(' ');
  group = [];
  clearTimeout(hideT);
  hideT = setTimeout(() => { shown = ''; schedule(); }, 2500);
  schedule();
}

function update() {
  queued = false;
  const player = typeof site.player === 'function' ? site.player() : document.querySelector(site.player);
  if (!player) return;
  if (!cfg.enabled) { box.hidden = true; return; }
  if (box.parentNode !== player) {
    if (getComputedStyle(player).position === 'static') player.style.position = 'relative'; // the pill is positioned inside it
    player.appendChild(box);
    player.querySelector('video')?.addEventListener('seeking', clearAll);
  }
  // The site's own caption stays in the DOM (hidden by CSS); we only read its text.
  const cur = [...player.querySelectorAll(site.text)]
    .map((s) => s.textContent)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean);
  const n = Math.max(3, cfg.words);

  if (site.native || !cfg.group) shown = cur.join(' '); // default: keep the site's own caption timing and length, only restyle
  else if (!cur.length) prev = [];
  else if (cur.join(' ') !== prev.join(' ')) {
    // Rolling captions repeat old words, so only the words past the overlap are new.
    let k = Math.min(prev.length, cur.length);
    while (k > 0 && prev.slice(-k).join(' ') !== cur.slice(0, k).join(' ')) k--;
    for (const w of cur.slice(k)) {
      group.push(w);
      // end the group when it is full, at . ! ?, or at a comma once it has a few words
      if (group.length >= n || /[.!?。！？।؟]$/.test(w) || (/,$/.test(w) && group.length >= 3)) complete();
    }
    prev = cur;
    clearTimeout(pauseT);
    if (group.length) pauseT = setTimeout(complete, PAUSE); // speaker paused
  }

  if (box.textContent !== shown) box.textContent = shown;
  box.hidden = !shown;
  box.style.fontSize = player.clientWidth * (cfg.size / 100) + 'px';
}

function schedule() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(update);
  }
}

// shortcut: observes the whole page, fine for one cheap rAF-throttled callback; narrow it if a site gets slow
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

chrome.storage.sync.get(DEFAULTS, (v) => {
  cfg = v;
  applyStyle();
});
chrome.storage.onChanged.addListener((changes) => {
  for (const k in changes) cfg[k] = changes[k].newValue;
  applyStyle();
});
