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
    typeof window !== "undefined" ? window :
    typeof self !== "undefined" ? self :
    typeof global !== "undefined" ? global : this,
    function () {

        const VERSION = "1.0.0";
        const STYLE_ID = "easyframe-runtime-style";
        const CLASS_SELECTOR = ".ef-sprite";
        const CHILD_CLASS_PREFIX = "ef_child_";

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

            clearStyleAndChildren();

            const elements = document.querySelectorAll(CLASS_SELECTOR);
            if (!elements.length) return;

            let combinedCSS = "";

            elements.forEach(el => {
                if (el.dataset.efProcessed === "true") return;

                const configStr = el.dataset.ef;
                const imageUrl = el.dataset.efSrc;
                if (!configStr) {
                    console.warn("[EasyFrame] Missing data-ef attribute, skipped.");
                    return;
                }

                const config = parseConfig(configStr);
                if (!config.size || !config.frames || !config.duration) {
                    console.warn("[EasyFrame] Missing required parameters in data-ef.");
                    return;
                }

                // 解析 data-ef-box
                const boxConfig = parseBoxAttr(el.dataset.efBox, config.size);

                const animationName = `ef_anim_${uid}`;
                const containerClass = `ef_container_${uid}`;
                const childClass = `ef_child_${uid}`;
                uid++;

                el.classList.add(containerClass);
                el.dataset.efProcessed = "true";

                // 创建子元素
                const child = document.createElement("div");
                child.className = childClass;
                el.appendChild(child);

                // 生成 CSS
                const css = generateCSS({
                    animationName,
                    containerClass,
                    childClass,
                    size: config.size,                // 原始帧尺寸 [w, h]
                    frames: config.frames,
                    duration: config.duration,
                    imageUrl,
                    parentWidth: boxConfig.width,
                    parentHeight: boxConfig.height,
                    fit: boxConfig.fit,
                    cycleMode: config.mode,
                    pixelated: config.pixel
                });

                combinedCSS += css;
            });

            injectStyle(combinedCSS);
        }

        /* =========================
        配置解析 (data-ef)
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
        盒子参数解析 (data-ef-box)
        格式: "<width> <height> [fit]"
        - width / height 可以是任何 CSS 长度，纯数字自动加 px
        - fit: none / contain / cover，默认 none
        ========================== */

        function parseBoxAttr(str, defaultSize) {
            const [defaultW, defaultH] = defaultSize;
            const defaultWidth = defaultW + "px";
            const defaultHeight = defaultH + "px";

            // 未设置 data-ef-box，使用默认值
            if (!str) {
                return {
                    width: defaultWidth,
                    height: defaultHeight,
                    fit: "none"
                };
            }

            const parts = str.trim().split(/\s+/);
            let width = parts[0] || defaultWidth;
            let height = parts[1] || defaultHeight;
            let fit = parts[2] || "none";

            // 为纯数字添加 px
            width = /^\d+$/.test(width) ? width + "px" : width;
            height = /^\d+$/.test(height) ? height + "px" : height;

            // 验证 fit 值
            if (!["none", "contain", "cover"].includes(fit)) {
                console.warn(`[EasyFrame] Invalid fit value "${fit}", using "none".`);
                fit = "none";
            }

            return { width, height, fit };
        }

        /* =========================
        CSS 生成（子元素模式）
        ========================== */

        function generateCSS({
            animationName,
            containerClass,
            childClass,
            size,
            frames,
            duration,
            imageUrl,
            parentWidth,
            parentHeight,
            fit,
            cycleMode,
            pixelated
        }) {
            const [frameWidth, frameHeight] = size; // 用于 aspect-ratio

            const framesArray = Array.isArray(frames) ? frames : [frames];
            const durationArray = Array.isArray(duration) ? duration : [duration];

            if (framesArray.length !== durationArray.length) {
                throw new Error("[EasyFrame] frames and duration length mismatch");
            }

            const totalFrames = framesArray.reduce((a, b) => a + b, 0);
            const totalDuration = durationArray.reduce((a, b) => a + b, 0);

            // ---------- 关键帧 (百分比偏移) ----------
            let keyframes = "";
            if (totalFrames > 1) {
                keyframes = `@keyframes ${animationName}{`;
                let cumulativePercent = 0;
                let frameIndex = 0;

                for (let seg = 0; seg < framesArray.length; seg++) {
                    const segFrames = framesArray[seg];
                    const segDuration = durationArray[seg];
                    const segPercent = segDuration / totalDuration;

                    for (let f = 0; f < segFrames; f++) {
                        const startPercent = cumulativePercent + (f / segFrames) * segPercent;
                        const percent = (startPercent * 100).toFixed(6);
                        const bgPercent = (frameIndex / (totalFrames - 1)) * 100;
                        keyframes += `${parseFloat(percent)}%{background-position:${bgPercent}% 0;animation-timing-function:steps(1,end);}`;
                        frameIndex++;
                    }
                    cumulativePercent += segPercent;
                }
                keyframes += `100%{background-position:100% 0;}}`;
            }

            // ---------- 父容器样式 ----------
            let containerRule = `.${containerClass}{`;
            containerRule += `position:relative;`;
            containerRule += `width:${parentWidth};`;
            containerRule += `height:${parentHeight};`;
            // cover 模式需要隐藏溢出
            if (fit === "cover") {
                containerRule += `overflow:hidden;`;
            }
            containerRule += `}`;

            // ---------- 子元素基础样式 ----------
            let childRule = `.${childClass}{`;
            childRule += `position:absolute;`;
            childRule += `background-repeat:no-repeat;`;
            childRule += `background-position:0 0;`;
            if (imageUrl) {
                childRule += `background-image:url("${imageUrl}");`;
            }
            // 背景图尺寸：总帧数 * 100% 宽度
            childRule += `background-size:${totalFrames * 100}% auto;`;
            childRule += `aspect-ratio:${frameWidth} / ${frameHeight};`;

            if (pixelated) {
                childRule += `image-rendering:pixelated;`;
            }

            // ---------- 定位规则 (根据 fit) ----------
            if (fit === "none") {
                // 固定原始尺寸，左上角对齐
                childRule += `
                    top:0;
                    left:0;
                    width:${frameWidth}px;
                    height:${frameHeight}px;
                `;
            } else if (fit === "contain") {
                childRule += `
                    top:0; left:0; right:0; bottom:0;
                    margin:auto;
                    max-width:100%;
                    max-height:100%;
                    width:auto;
                    height:auto;
                `;
            } else if (fit === "cover") {
                childRule += `
                    top:50%; left:50%;
                    transform:translate(-50%, -50%);
                    min-width:100%;
                    min-height:100%;
                    width:auto;
                    height:auto;
                `;
            }

            childRule += `}`;

            // ---------- 动画 (仅当有动画且总帧数>1) ----------
            if (cycleMode !== "none" && totalFrames > 1) {
                let animationValue = `${animationName} ${totalDuration}s`;

                // 单一段且总帧数>1时添加 steps
                if (!Array.isArray(frames) && totalFrames > 1) {
                    animationValue += ` steps(${totalFrames})`;
                }

                if (cycleMode === "loop") {
                    animationValue += " infinite";
                } else if (cycleMode === "pingpong") {
                    animationValue += " infinite alternate";
                }

                // 将动画插入到子元素样式中（替换最后的 }）
                childRule = childRule.slice(0, -1) + `animation:${animationValue};}`;
            }

            return containerRule + childRule + (keyframes || "");
        }

        /* =========================
        Style 注入与清理
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

        function clearStyleAndChildren() {
            // 移除样式
            const oldStyle = document.getElementById(STYLE_ID);
            if (oldStyle) oldStyle.remove();

            // 移除所有内部生成的子元素，并清除处理标记
            document.querySelectorAll(CLASS_SELECTOR).forEach(el => {
                const children = el.querySelectorAll(`[class^="${CHILD_CLASS_PREFIX}"]`);
                children.forEach(child => child.remove());
                delete el.dataset.efProcessed;
            });
        }

        return EasyFrame;
    }
));