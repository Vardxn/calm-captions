# Calm Captions

Calmer subtitles for YouTube (including YouTube videos embedded on other sites) and Udemy. Captions in a soft rounded pill with an easier-on-the-eyes font, and your own size and colors. Collects no data.

## Install
- **Edge / Firefox:** install from the add-on store (link coming soon).
- **Chrome (manual, 4 steps):**
  1. Download `calm-captions-chromium.zip` from the Releases page and unzip it.
  2. Open `chrome://extensions` and turn on Developer mode.
  3. Click **Load unpacked** and pick the unzipped folder.
  4. Open a YouTube video and turn captions on (CC).

Click the extension icon to turn it on or off and change text size, background opacity and colors. On Udemy it also follows Udemy's own caption menu.

## Build
`./build.sh` writes both zips to `dist/`.

## Languages
The rounded font covers Latin scripts (English, Spanish, French, Portuguese...). Hindi, Arabic, Chinese, Japanese and Russian use your system's fonts, with right-to-left text handled automatically.

## Known limits
- Udemy support is based on its current page structure and may need a fix if Udemy changes.
- Netflix, Prime Video and Hotstar are not supported.

MIT licensed. See [PRIVACY.md](PRIVACY.md).
