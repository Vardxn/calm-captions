const DEFAULTS = { enabled: true, size: 100, opacity: 35, bg: '#1e1e1e', color: '#ffffff' };
chrome.storage.local.get(DEFAULTS, (v) => {
  for (const k in DEFAULTS) {
    const el = document.getElementById(k);
    if (el.type === 'checkbox') el.checked = v[k];
    else el.value = v[k];
    el.addEventListener('input', () => {
      chrome.storage.local.set({ [k]: el.type === 'checkbox' ? el.checked : el.type === 'range' ? +el.value : el.value });
    });
  }
});
