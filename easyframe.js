/*!
 * EasyFrame.js
 * Sprite Sheet Animation CSS Generator Runtime
 * Author: github@ShuninYu
 */

(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        global.EasyFrame = factory();
    }
}(
    // 更可靠的全局对象检测：浏览器(window) -> Web Worker(self) -> Node.js(global) -> 回退(this)
    typeof window !== "undefined" ? window :
    typeof self !== "undefined" ? self :
    typeof global !== "undefined" ? global : this,
    function () {

        const VERSION = "1.0.0";
        const STYLE_ID = "easyframe-runtime-style";
        const CLASS_SELECTOR = ".ef-sprite";

        let uid = 0;

        /* =========================
        公共API
        ========================== */

        const EasyFrame = {
            version: VERSION,
            init,
            refresh: init
        };

        /* =========================
        自动初始化
        ========================== */

        if (typeof document !== "undefined") {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", init);
            } else {
                init();
            }
        }

        /* =========================
        核心初始化
        ========================== */

        function init() {
            if (typeof document === "undefined") return;

            const elements = document.querySelectorAll(CLASS_SELECTOR);
            if (!elements.length) return;

            clearStyle();

            let combinedCSS = "";

            elements.forEach(el => {

                if (el.dataset.efProcessed === "true") return;

                const configStr = el.dataset.ef;
                const imageUrl = el.dataset.efSrc;

                if (!configStr) return;

                const config = parseConfig(configStr);

                if (!config.size || !config.frames || !config.duration) {
                    console.warn("[EasyFrame] Missing required parameters.");
                    return;
                }

                const animationName = `ef_anim_${uid}`;
                const className = `ef_auto_${uid}`;
                uid++;

                el.classList.add(className);
                el.dataset.efProcessed = "true";

                const { classRule, keyframesRule } =
                    generateCSS({
                        animationName,
                        className,
                        size: config.size,
                        frames: config.frames,
                        duration: config.duration,
                        imageUrl,
                        cycleMode: config.mode,
                        pixelated: config.pixel
                    });

                combinedCSS += classRule + keyframesRule;
            });

            injectStyle(combinedCSS);
        }

        /* =========================
        配置分析
        ========================== */

        function parseConfig(str) {

            const config = {
                mode: "loop",
                pixel: false
            };

            const parts = str.split(";")
                .map(s => s.trim())
                .filter(Boolean);

            parts.forEach(part => {

                if (part.startsWith("size:")) {
                    const value = part.replace("size:", "");
                    const [w, h] = value.split("x").map(Number);
                    config.size = [w, h];
                }

                else if (part.startsWith("frames:")) {
                    const arr = part.replace("frames:", "")
                        .split(",")
                        .map(Number);
                    config.frames = arr.length === 1 ? arr[0] : arr;
                }

                else if (part.startsWith("duration:")) {
                    const arr = part.replace("duration:", "")
                        .split(",")
                        .map(Number);
                    config.duration = arr.length === 1 ? arr[0] : arr;
                }

                else if (part.startsWith("mode:")) {
                    config.mode = part.replace("mode:", "");
                }

                else if (part === "pixel") {
                    config.pixel = true;
                }

            });

            return config;
        }

        /* =========================
        CSS生成
        ========================== */

        function generateCSS({
            animationName,
            className,
            size,
            frames,
            duration,
            imageUrl,
            cycleMode,
            pixelated
        }) {

            const [width, height] = size;

            const framesArray = Array.isArray(frames) ? frames : [frames];
            const durationArray = Array.isArray(duration) ? duration : [duration];

            if (framesArray.length !== durationArray.length) {
                throw new Error("frames and duration length mismatch");
            }

            const totalFrames = framesArray.reduce((a, b) => a + b, 0);
            const totalDuration = durationArray.reduce((a, b) => a + b, 0);

            let keyframes = "";
            let cumulativePercent = 0;
            let frameIndex = 0;

            keyframes += `@keyframes ${animationName}{`;

            for (let seg = 0; seg < framesArray.length; seg++) {

                const segFrames = framesArray[seg];
                const segDuration = durationArray[seg];
                const segPercent = segDuration / totalDuration;

                for (let f = 0; f < segFrames; f++) {

                    const startPercent =
                        cumulativePercent +
                        (f / segFrames) * segPercent;

                    const percent = (startPercent * 100).toFixed(6);

                    keyframes +=
                        `${parseFloat(percent)}%{` +
                        `background-position:${-frameIndex * width}px 0;` +
                        `animation-timing-function:steps(1,end);}`;

                    frameIndex++;
                }

                cumulativePercent += segPercent;
            }

            keyframes += `100%{background-position:${-(totalFrames - 1) * width}px 0;}}`;

            let classRule =
                `.${className}{` +
                `width:${width}px;` +
                `height:${height}px;` +
                `background-position:0 0;` +
                `background-repeat:no-repeat;`;

            if (imageUrl) {
                classRule += `background-image:url("${imageUrl}");`;
            }

            if (pixelated) {
                classRule += `image-rendering:pixelated;`;
            }

            if (cycleMode !== "none") {

                let animationValue =
                    `${animationName} ${totalDuration}s`;

                if (!Array.isArray(frames) && totalFrames > 1) {
                    animationValue += ` steps(${totalFrames})`;
                }

                if (cycleMode === "loop") {
                    animationValue += " infinite";
                }
                else if (cycleMode === "pingpong") {
                    animationValue += " infinite alternate";
                }

                classRule += `animation:${animationValue};`;
            }

            classRule += "}";

            return {
                classRule,
                keyframesRule: keyframes
            };
        }

        /* =========================
        Style注入
        ========================== */

        function injectStyle(css) {

            if (!css) return;

            let style = document.getElementById(STYLE_ID);

            if (!style) {
                style = document.createElement("style");
                style.id = STYLE_ID;
                document.head.appendChild(style);
            }

            style.textContent += css;
        }

        function clearStyle() {
            const old = document.getElementById(STYLE_ID);
            if (old) old.remove();
        }

        return EasyFrame;

    }
));