// Turns YouTube's caption data (json3) into whole cues, like Udemy shows them.
// Manual captions already come as cues. Auto captions come as timed words, so group them.
function buildCues(events, asr) {
  const out = [];
  if (!asr) {
    for (const ev of events) {
      // keep the caption's own line breaks, tidy the spaces inside each line
      const text = (ev.segs || []).map((s) => s.utf8).join('').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
      if (text) out.push({ s: ev.tStartMs, e: ev.tStartMs + (ev.dDurationMs || 2000), text });
    }
    return out;
  }
  const words = [];
  for (const ev of events) {
    for (const sg of ev.segs || []) {
      const w = sg.utf8.trim();
      const s = ev.tStartMs + (sg.tOffsetMs || 0);
      if (w && (!words.length || s > words[words.length - 1].s)) words.push({ s, w });
    }
  }
  let cur = [];
  const flush = () => {
    if (!cur.length) return;
    // a pause inside the cue starts a second line
    const text = cur.map((x, i) => (i === 0 ? '' : x.s - cur[i - 1].s > 450 ? '\n' : ' ') + x.w).join('');
    out.push({ s: cur[0].s, e: cur[cur.length - 1].s + 1500, text });
    cur = [];
  };
  for (const x of words) {
    const last = cur[cur.length - 1];
    // new cue after a pause, at a sentence end, or when the line gets long
    if (last && (x.s - last.s > 800 || cur.length >= 8 || /[.!?]$/.test(last.w))) flush();
    cur.push(x);
  }
  flush();
  for (let i = 0; i < out.length - 1; i++) out[i].e = Math.min(out[i].e, out[i + 1].s);
  return out;
}

// The cue showing at time ms, or ''. cues are sorted by start.
function cueAt(cues, ms) {
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].s <= ms) lo = mid + 1;
    else hi = mid - 1;
  }
  const c = cues[hi];
  return c && ms < c.e ? c.text : '';
}

if (typeof module !== 'undefined') module.exports = { buildCues, cueAt };
