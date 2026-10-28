const assert = require('assert');
const { buildCues, cueAt } = require('../src/cues.js');

// manual captions: one cue per event, whitespace cleaned
let c = buildCues([{ tStartMs: 1000, dDurationMs: 2000, segs: [{ utf8: 'Hello\nthere' }] }, { tStartMs: 5000, segs: [{ utf8: '\n' }] }], false);
assert.deepStrictEqual(c, [{ s: 1000, e: 3000, text: 'Hello\nthere' }]); // line break kept
assert.strictEqual(cueAt(c, 999), '');
assert.strictEqual(cueAt(c, 1000), 'Hello\nthere');
assert.strictEqual(cueAt(c, 3000), '');

// auto captions: words group into cues at pauses and sentence ends
const ev = [
  { tStartMs: 0, segs: [{ utf8: 'so' }, { utf8: ' this', tOffsetMs: 300 }, { utf8: ' works.', tOffsetMs: 600 }] },
  { tStartMs: 1000, segs: [{ utf8: 'next', tOffsetMs: 0 }, { utf8: ' one', tOffsetMs: 300 }] },
  { tStartMs: 5000, segs: [{ utf8: 'later' }] },
];
c = buildCues(ev, true);
assert.deepStrictEqual(c.map((x) => x.text), ['so this works.', 'next one', 'later']);
assert.strictEqual(cueAt(c, 700), 'so this works.');
assert.strictEqual(cueAt(c, 1000), 'next one'); // trimmed so cues never overlap
assert.strictEqual(cueAt(c, 3500), ''); // gap between cues shows nothing
assert.deepStrictEqual(buildCues([], true), []);
assert.strictEqual(cueAt([], 10), '');

// a pause inside a cue (more than 0.45s, less than 0.8s) breaks it into two lines
c = buildCues([{ tStartMs: 0, segs: [{ utf8: 'one' }, { utf8: ' two', tOffsetMs: 200 }, { utf8: ' three', tOffsetMs: 900 }] }], true);
assert.strictEqual(c[0].text, 'one two\nthree');

// a line never grows past 8 words
const long = Array.from({ length: 20 }, (_, i) => ({ tStartMs: i * 200, segs: [{ utf8: 'w' + i }] }));
assert.ok(buildCues(long, true).every((x) => x.text.split(' ').length <= 8));
console.log('cues tests passed');
