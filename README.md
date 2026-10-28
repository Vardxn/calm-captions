# Calm Captions

Calmer subtitles for YouTube (including YouTube videos embedded on other sites) and Udemy. Short groups of words in a soft rounded pill, with your own font, size and colors. Collects no data.

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

## Languages
The rounded font covers Latin scripts (English, Spanish, French, Portuguese...). Hindi, Arabic, Chinese, Japanese and Russian use your system's fonts, with right-to-left text handled automatically.

## Known limits
- With *Group words* on, groups appear once their last word is spoken, so there is about one group of delay.
- Udemy support is based on its current page structure and may need a fix if Udemy changes.
- Netflix, Prime Video and Hotstar are not supported.

MIT licensed. See [PRIVACY.md](PRIVACY.md).
