# EasyFrame

![EasyFrame](https://cdn.jsdelivr.net/gh/ShuninYu/easy-frame@main/favicon.png)

> **Lightweight · Zero-config · Zero-JS usage · Just drop and animate**

---

# EasyFrame

> Zero-JavaScript Sprite Sheet Animation Generator
> Lightweight, automatic, plug-and-play.

EasyFrame is a minimal runtime JavaScript library that automatically generates CSS sprite sheet animations directly from HTML data attributes.

No manual CSS writing.  
No manual JavaScript initialization.  
Just add a class and configuration — and it works.

## [Official Website](https://easyframe.js.org)

---

## ✨ Features

* Zero configuration required
* No manual JavaScript initialization
* Automatic CSS & `@keyframes` generation
* Supports segmented animations
* Supports loop / ping-pong / single play
* Optional pixelated rendering
* **Responsive container** with `data-ef-box` (contain/cover modes)
* Works via CDN, local file, or npm
* UMD + ESM build

---

## 🚀 Installation

### CDN (Recommended)

```html
<script src="https://cdn.jsdelivr.net/gh/ShuninYu/easy-frame@v1.1.1/dist/easy-frame.umd.min.js"></script>
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

That’s it. EasyFrame automatically creates a child element inside `.ef-sprite` to host the animation. The parent element’s size defaults to the `size` value (in pixels).

---

## 🧩 Configuration

All animation settings are defined inside the `data-ef` attribute.

Format:

```
data-ef="key:value;key:value;flag"
```

### Required Parameters

| Key      | Description                                            | Example                                |
| -------- | ------------------------------------------------------ | -------------------------------------- |
| size     | Frame size (width x height) – used for aspect ratio    | `size:64x64`                           |
| frames   | Number or segments                                     | `frames:6` or `frames:4,3,7`           |
| duration | Duration in seconds                                    | `duration:1` or `duration:0.4,0.2,0.6` |

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

## 📦 Container Sizing and Fit

Use `data-ef-box` to control the dimensions of the parent container and how the sprite fills it.

Format:

```
data-ef-box="<width> <height> [fit]"
```

- **width / height**: any valid CSS length (e.g., `50vw`, `300px`, `100%`). Plain numbers are automatically treated as pixels.
- **fit** (optional, default `none`):
  - `none` – Child element keeps the original frame size (from `size`) and sits at the top-left corner.
  - `contain` – Sprite scales to fit entirely inside the parent (letterboxing).
  - `cover` – Sprite scales to cover the parent (may be cropped).

**Examples:**

```html
<!-- Parent size 50vw x 300px, cover mode -->
<div class="ef-sprite"
     data-ef="size:100x200;frames:8;duration:1"
     data-ef-src="sprite.png"
     data-ef-box="50vw 300px cover">
</div>

<!-- Parent size 200px x 150px, contain mode -->
<div class="ef-sprite"
     data-ef="size:64x64;frames:6;duration:1"
     data-ef-src="walk.png"
     data-ef-box="200px 150px contain">
</div>

<!-- Parent size defaults to frame size (64x64 px), fit=none -->
<div class="ef-sprite"
     data-ef="size:64x64;frames:6;duration:1"
     data-ef-src="walk.png">
</div>
```

If `data-ef-box` is omitted, the parent container’s dimensions are taken from the `size` value (in pixels), and `fit` is `none`. This ensures backward compatibility with previous versions.

> **Note:** The sprite’s aspect ratio is always preserved according to the `size` in `data-ef`.

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

## 🎨 Styling the Child Element

EasyFrame automatically adds a fixed class name `ef-child` to every generated child element that holds the animation. This allows you to target and style the animated element reliably, regardless of the dynamic UID suffix.

### Global styling

To apply styles to all EasyFrame animations, simply use the `.ef-child` selector:

```css
.ef-child {
  filter: drop-shadow(0 0 4px gold);
  border-radius: 8px;
}
```

### Per‑instance styling

If you need to style only a specific animation, add your own class to the parent `.ef-sprite` element, then use a descendant selector:

```html
<div class="ef-sprite my-walk-cycle" data-ef="size:64x64;frames:8;duration:1" data-ef-src="walk.png"></div>

<style>
  .my-walk-cycle .ef-child {
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
    transform: scale(1.1);
  }
</style>
```

> **Important:** Do not rely on the dynamically generated class names like `ef_child_2` – they change when the page structure is modified. Always use the fixed `.ef-child` class or a parent‑based selector.

---

## 🔄 Manual Refresh

If elements are added dynamically:

```js
EasyFrame.refresh();   // Clears old child elements and regenerates styles
```

---

## 📦 API

| Method                | Description                    |
| --------------------- | ------------------------------ |
| `EasyFrame.init()`    | Manually initialize            |
| `EasyFrame.refresh()` | Re-scan DOM (clean & rebuild)  |
| `EasyFrame.version`   | Library version                |

---

## 🌍 Browser Support

Works in all modern browsers that support:

* `querySelectorAll`
* `classList`
* `dataset`
* CSS animations
* `aspect-ratio` (modern browsers; fallback included for none)

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