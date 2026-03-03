# EasyFrame

![EasyFrame](https://cdn.jsdelivr.net/gh/ShuninYu/easy-frame@main/favicon.png)

**EasyFrame** is a tool that helps you create sprite sheet animation CSS code.

## [Official Website](https://easyframe.js.org)

> **Lightweight · Zero-config · Zero-JS usage · Just drop and animate**

---

# EasyFrame

> Zero-JavaScript Sprite Sheet Animation Generator
> Lightweight, automatic, plug-and-play.

EasyFrame is a minimal runtime JavaScript library that automatically generates CSS sprite sheet animations directly from HTML data attributes.

No manual CSS writing.
No manual JavaScript initialization.
Just add a class and configuration — and it works.

---

## ✨ Features

* Zero configuration required
* No manual JavaScript initialization
* Automatic CSS & `@keyframes` generation
* Supports segmented animations
* Supports loop / ping-pong / single play
* Optional pixelated rendering
* Works via CDN, local file, or npm
* UMD + ESM build

---

## 🚀 Installation

### CDN (Recommended)

```html
<script src="https://cdn.jsdelivr.net/gh/ShuninYu/easy-frame@v1.0.0/dist/easy-frame.umd.min.js"></script>
```

or

```html
<script src="https://cdn.jsdelivr.net/npm/easy-frame/dist/easy-frame.umd.min.js"></script>
```

---

### NPM

```bash
npm install easyframe
```

ES Module:

```js
import EasyFrame from "easyframe";
```

CommonJS:

```js
const EasyFrame = require("easyframe");
```

---

## ⚡ Quick Start

```html
<script src="easyframe.min.js"></script>

<div
  class="ef-sprite"
  data-ef="size:64x64;frames:6;duration:1"
  data-ef-src="/images/character.png">
</div>
```

That’s it.

When the page loads, EasyFrame:

1. Scans all `.ef-sprite` elements
2. Parses the `data-ef` configuration
3. Generates CSS classes
4. Injects `@keyframes` into `<head>`
5. Automatically applies animation

---

## 🧩 Configuration

All animation settings are defined inside the `data-ef` attribute.

Format:

```
data-ef="key:value;key:value;flag"
```

### Required Parameters

| Key      | Description                 | Example                                |
| -------- | --------------------------- | -------------------------------------- |
| size     | Frame size (width x height) | `size:64x64`                           |
| frames   | Number or segments          | `frames:6` or `frames:4,3,7`           |
| duration | Duration in seconds         | `duration:1` or `duration:0.4,0.2,0.6` |

---

### Optional Parameters

| Key   | Description                 | Example     |
| ----- | --------------------------- | ----------- |
| mode  | Animation mode              | `mode:loop` |
| pixel | Enables pixelated rendering | `pixel`     |

---

## 🔁 Animation Modes

| Mode     | Behavior                |
| -------- | ----------------------- |
| loop     | Infinite loop (default) |
| pingpong | Infinite alternate      |
| none     | Play once               |

Example:

```html
data-ef="size:64x64;frames:4;duration:1;mode:pingpong"
```

---

## 🎞 Segmented Animation Example

```html
<div
  class="ef-sprite"
  data-ef="size:64x64;frames:4,3,7;duration:0.4,0.2,0.6;mode:pingpong;pixel"
  data-ef-src="/sprite/man.png">
</div>
```

This creates:

* 3 animation segments
* Custom duration per segment
* Ping-pong looping
* Pixelated rendering

---

## 🖼 Background Image

Set sprite image using:

```
data-ef-src="/path/to/sprite.png"
```

If omitted, background image must be defined in CSS.

---

## 🔄 Manual Refresh

If elements are added dynamically:

```js
EasyFrame.refresh();
```

---

## 📦 API

| Method                | Description         |
| --------------------- | ------------------- |
| `EasyFrame.init()`    | Manually initialize |
| `EasyFrame.refresh()` | Re-scan DOM         |
| `EasyFrame.version`   | Library version     |

---

## 🌍 Browser Support

Works in all modern browsers that support:

* `querySelectorAll`
* `classList`
* `dataset`
* CSS animations

No dependencies required.

---

## 📏 Bundle Size

* ~3KB minified
* No external dependencies

---

## 🛠 Design Philosophy

EasyFrame focuses on:

* Simplicity
* Minimal runtime cost
* Zero boilerplate
* Clean HTML-driven configuration

Advanced features (multi-row sprites, viewport detection, etc.) may be added in future versions, but the core will remain lightweight.

---

## 📄 License

MIT License
© 2026 ShuninYu