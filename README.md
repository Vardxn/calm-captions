# Calm Captions

Calmer subtitles for YouTube and Udemy (Netflix and Prime Video are experimental). Short groups of words in a soft rounded pill, with your own font, size and colors. Collects no data.

## Install
- **Edge / Firefox:** install from the add-on store (link coming soon).
- **Chrome (manual, 4 steps):**
  1. Download `calm-captions-chromium.zip` from the Releases page and unzip it.
  2. Open `chrome://extensions` and turn on Developer mode.
  3. Click **Load unpacked** and pick the unzipped folder.
  4. Open a YouTube video and turn captions on (CC).

Click the extension icon to change words per group, size, colors and position.

## Build
`./build.sh` writes both zips to `dist/`.

## Known limits
- Groups appear once their last word is spoken, so there is about one group of delay.
- Udemy, Netflix and Prime Video selectors are untested; Hotstar is not supported yet.

MIT licensed. See [PRIVACY.md](PRIVACY.md).
