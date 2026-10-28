const DEFAULTS = { enabled: true, group: false, words: 6, size: 2.4, opacity: 72, bg: '#555555', color: '#ffffff', radius: 45, bottom: 13, font: 'outfit' };
chrome.storage.sync.get(DEFAULTS, (v) => {
  for (const k in DEFAULTS) {
    const el = document.getElementById(k);
    if (el.type === 'checkbox') el.checked = v[k]; else el.value = v[k];
    el.addEventListener('input', () => {
      chrome.storage.sync.set({ [k]: el.type === 'checkbox' ? el.checked : el.type === 'number' || el.type === 'range' ? +el.value : el.value });
    });
  }
});
