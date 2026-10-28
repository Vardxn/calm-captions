const DEFAULTS = { words: 6, size: 2.4, opacity: 72, bg: '#555555', color: '#ffffff', radius: 45, bottom: 13, font: 'outfit' };
chrome.storage.sync.get(DEFAULTS, (v) => {
  for (const k in DEFAULTS) {
    const el = document.getElementById(k);
    el.value = v[k];
    el.addEventListener('input', () => {
      chrome.storage.sync.set({ [k]: el.type === 'number' || el.type === 'range' ? +el.value : el.value });
    });
  }
});
