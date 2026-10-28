

https://github.com/user-attachments/assets/9982620c-422f-4411-94d6-6ec9304d06c2



https://github.com/user-attachments/assets/16181766-cbee-4bff-a608-dbfa3f90e316

# Calm Captions

Easier-on-the-eyes captions for **YouTube** (including YouTube videos embedded on other sites) and **Udemy**. Instead of a hard black box, you get a soft, rounded, frosted-glass pill with a clean font. No data is collected.

## Install (Chrome, Edge, Brave)
1. Download `calm-captions-chromium.zip` from the [Releases page](../../releases/latest) and unzip it.
2. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and pick the unzipped folder.
4. Open a YouTube video or Udemy lesson and turn captions on (CC).

Firefox: use `calm-captions-firefox.zip` and load it from `about:debugging` → *This Firefox* → *Load Temporary Add-on*.

## Settings
Click the extension icon to turn it on or off and change text size, background opacity and colors. On Udemy it also follows Udemy's own caption menu (font size, background opacity, display under video).

## Languages
The rounded font covers Latin scripts (English, Spanish, French, Portuguese...). Hindi, Arabic, Chinese, Japanese and Russian use your system's fonts, and right-to-left text flips automatically.

## Build
```sh
./build.sh   # writes dist/calm-captions-chromium.zip and dist/calm-captions-firefox.zip
```
Source is in `src/`; there are no dependencies.

## Known limits
- Udemy support follows Udemy's current page structure and may need a fix if Udemy changes it.
- Netflix, Prime Video and Hotstar are not supported.
- On YouTube the extension reads the caption file the player loads, so captions follow the real timing. If it can't find that file, it falls back to the page's own caption text, which appears word by word.

MIT licensed. See [PRIVACY.md](PRIVACY.md).
