// script.js - EasyFrame 生成器核心逻辑
// 包含生成 CSS 的核心函数和页面交互

(function() {
    // 等待 DOM 加载完成后再执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // ---------- 核心生成函数 (独立, 无DOM依赖) ----------
        function generateAnimeCursorCSS({ animationName, className, size, frames, duration, imageUrl = '', cycleMode = 'loop', pixelated = false }) {
            if (!animationName || !className || !size || !frames || !duration) {
                throw new Error('Missing required parameters');
            }
            const [width, height] = size;
            if (!width || !height || width <= 0 || height <= 0) {
                throw new Error('Size must be positive numbers');
            }

            let framesArray, durationArray;
            const isFramesArray = Array.isArray(frames);
            const isDurationArray = Array.isArray(duration);

            if (!isFramesArray && !isDurationArray && typeof frames === 'number' && typeof duration === 'number') {
                framesArray = [frames];
                durationArray = [duration];
            } else if (isFramesArray && isDurationArray) {
                if (frames.length !== duration.length) {
                    throw new Error('frames and duration arrays must have same length');
                }
                framesArray = frames;
                durationArray = duration;
            } else {
                throw new Error('frames and duration must be both numbers or both arrays of same length');
            }

            framesArray.forEach((f, i) => { if (!Number.isInteger(f) || f <= 0) throw new Error(`frames[${i}] must be positive integer`); });
            durationArray.forEach((d, i) => { if (typeof d !== 'number' || d <= 0) throw new Error(`duration[${i}] must be positive number`); });

            const totalFrames = framesArray.reduce((a, b) => a + b, 0);
            const totalDuration = durationArray.reduce((a, b) => a + b, 0);

            let keyframes = [];
            let cumulativePercent = 0;
            let frameIndex = 0;

            for (let seg = 0; seg < framesArray.length; seg++) {
                const segFrames = framesArray[seg];
                const segDuration = durationArray[seg];
                const segPercent = segDuration / totalDuration;

                for (let f = 0; f < segFrames; f++) {
                    const startPercent = cumulativePercent + (f / segFrames) * segPercent;
                    keyframes.push({
                        percent: startPercent,
                        bgPosX: -frameIndex * width
                    });
                    frameIndex++;
                }
                cumulativePercent += segPercent;
            }
            keyframes.push({
                percent: 1.0,
                bgPosX: -(totalFrames - 1) * width
            });

            let keyframesRule = `@keyframes ${animationName} {\n`;
            for (let kf of keyframes) {
                let percent = (kf.percent * 100).toFixed(6);
                if (percent.includes('.')) {
                    percent = parseFloat(percent).toString();
                    if (percent === '100') percent = '100';
                }
                if (kf.percent === 1.0) percent = '100';
                keyframesRule += `    ${percent}% {\n`;
                keyframesRule += `        background-position: ${kf.bgPosX}px 0;\n`;
                if (kf !== keyframes[keyframes.length - 1]) {
                    keyframesRule += `        animation-timing-function: steps(1, end);\n`;
                }
                keyframesRule += `    }\n`;
            }
            keyframesRule += `}`;

            let classRule = `.${className} {\n`;
            classRule += `    width: ${width}px;\n`;
            classRule += `    height: ${height}px;\n`;
            if (imageUrl && imageUrl.trim() !== '') {
                classRule += `    background-image: url("${imageUrl}");\n`;
            }
            classRule += `    background-position: 0 0;\n`;
            classRule += `    background-repeat: no-repeat;\n`;
            if (pixelated) {
                classRule += `    image-rendering: pixelated;\n`;
            }

            if (cycleMode !== 'none') {
                let animationValue = `${animationName} ${totalDuration}s`;
                const originalFramesIsArray = Array.isArray(frames);
                if (!originalFramesIsArray && totalFrames > 1) {
                    animationValue += ` steps(${totalFrames})`;
                }
                if (cycleMode === 'loop') {
                    animationValue += ` infinite`;
                } else if (cycleMode === 'pingpong') {
                    animationValue += ` infinite alternate`;
                }
                classRule += `    animation: ${animationValue};\n`;
            }
            classRule += `}`;

            return { classRule, keyframesRule };
        }

        // ---------- CSS 压缩函数 ----------
        function minifyCSS(css) {
            // 去除多余空白：将连续的空白字符（空格、换行、制表符）替换为一个空格
            let min = css.replace(/\s+/g, ' ');
            // 去除 { 前后的空格
            min = min.replace(/\s*{\s*/g, '{');
            // 去除 } 前后的空格
            min = min.replace(/\s*}\s*/g, '}');
            // 去除 ; 后的空格
            min = min.replace(/;\s*/g, ';');
            // 去除 : 后的空格（但保留值内的空格，例如 animation 值中的空格）
            min = min.replace(/:\s+/g, ':');
            // 去除 , 后的空格（如果有）
            min = min.replace(/,\s*/g, ',');
            // 去除开头和结尾的空格
            min = min.trim();
            return min;
        }

        // ---------- 获取 DOM 元素并检查 ----------
        function getElement(id) {
            const el = document.getElementById(id);
            if (!el) {
                console.error(`[EasyFrame] Element with id "${id}" not found.`);
            }
            return el;
        }

        const animNameInput = getElement('animName');
        const classNameInput = getElement('className');
        const widthInput = getElement('width');
        const heightInput = getElement('height');
        const imageUrlInput = getElement('imageUrl');
        const pixelatedCheckbox = getElement('pixelatedCheckbox');
        const framesInput = getElement('frames');
        const durationInput = getElement('duration');
        const cycleModeSelect = getElement('cycleMode');
        const generateBtn = getElement('generateBtn');
        const classOutput = getElement('classOutput');
        const keyframesOutput = getElement('keyframesOutput');
        const classPreview = getElement('classPreview');
        const keyframePreview = getElement('keyframePreview');

        const switchCode = getElement('switchCode');
        const codeBox = getElement('codeBox');

        // 预览相关
        const previewSection = getElement('previewSection');
        const previewAnim = getElement('previewAnim');
        const previewError = getElement('previewError');

        // 图片上传相关
        const imageUrlGroup = getElement('imageUrlGroup');
        const uploadGroup = getElement('uploadGroup');
        const uploadToggleBtn = getElement('uploadToggleBtn');
        const dropZone = getElement('dropZone');
        const fileInput = getElement('fileInput');
        const uploadPreviewContainer = getElement('uploadPreviewContainer');
        const uploadPreviewImg = getElement('uploadPreviewImg');
        const backToUrlBtn = getElement('backToUrlBtn');
        const uploadError = getElement('error-upload');

        // 错误元素映射
        const errorElements = {
            animName: getElement('error-animName'),
            className: getElement('error-className'),
            width: getElement('error-width'),
            height: getElement('error-height'),
            frames: getElement('error-frames'),
            duration: getElement('error-duration')
        };

        // 复制按钮
        const copyClassBtn = getElement('copyClassBtn');
        const copyKeyframesBtn = getElement('copyKeyframesBtn');

        // Minified 复选框
        const minifyClassCheckbox = getElement('minifyClass');
        const minifyKeyframesCheckbox = getElement('minifyKeyframes');

        // 如果关键元素缺失，终止执行
        if (!animNameInput || !classNameInput || !generateBtn) {
            console.error('[EasyFrame] Critical elements missing, aborting.');
            return;
        }

        // 存储原始 CSS（未压缩）
        let originalClassCSS = '';
        let originalKeyframesCSS = '';

        // 状态变量
        let localImageBlobUrl = null;

        // 动态样式标签
        let dynamicStyleId = 'dynamic-anime-css';
        function removeDynamicStyle() {
            const old = document.getElementById(dynamicStyleId);
            if (old) old.remove();
        }

        // 预览名称更新
        function updatePreviews() {
            if (classPreview) classPreview.innerText = '.' + (classNameInput.value || 'class-name');
            if (keyframePreview) keyframePreview.innerText = animNameInput.value || 'animation-name';
        }
        animNameInput.addEventListener('input', updatePreviews);
        classNameInput.addEventListener('input', updatePreviews);
        updatePreviews();

        // ---------- 清除所有错误提示 ----------
        function clearAllErrors() {
            Object.values(errorElements).forEach(el => { if (el) el.style.display = 'none'; });
            if (uploadError) uploadError.style.display = 'none';
            if (previewError) previewError.textContent = '';
        }

        // ---------- 显示单个错误 ----------
        function showError(fieldId, message) {
            const el = errorElements[fieldId];
            if (el) {
                el.textContent = message;
                el.style.display = 'block';
            }
        }

        // ---------- 图片上传逻辑 ----------
        function showUploadMode() {
            if (imageUrlGroup) imageUrlGroup.style.display = 'none';
            if (uploadGroup) uploadGroup.style.display = 'block';
            if (uploadPreviewContainer) uploadPreviewContainer.style.display = 'none';
            if (dropZone) dropZone.style.display = 'block';
            if (uploadError) uploadError.style.display = 'none';
        }

        function resetToUrlMode() {
            if (imageUrlGroup) imageUrlGroup.style.display = 'flex';
            if (uploadGroup) uploadGroup.style.display = 'none';
            if (localImageBlobUrl) {
                URL.revokeObjectURL(localImageBlobUrl);
                localImageBlobUrl = null;
            }
            if (uploadPreviewContainer) uploadPreviewContainer.style.display = 'none';
            if (uploadPreviewImg) uploadPreviewImg.src = '';
            if (dropZone) dropZone.style.display = 'block';
            if (uploadError) uploadError.style.display = 'none';
        }

        if (uploadToggleBtn) uploadToggleBtn.addEventListener('click', showUploadMode);
        if (backToUrlBtn) backToUrlBtn.addEventListener('click', resetToUrlMode);

        if (dropZone) {
            dropZone.addEventListener('click', () => fileInput.click());

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleImageFile(files[0]);
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleImageFile(e.target.files[0]);
                }
            });
        }

        function handleImageFile(file) {
            if (!file.type.startsWith('image/')) {
                if (uploadError) {
                    uploadError.textContent = 'Please select image file';
                    uploadError.style.display = 'block';
                }
                return;
            }
            if (uploadError) uploadError.style.display = 'none';
            if (localImageBlobUrl) {
                URL.revokeObjectURL(localImageBlobUrl);
            }
            localImageBlobUrl = URL.createObjectURL(file);
            if (uploadPreviewImg) uploadPreviewImg.src = localImageBlobUrl;
            if (uploadPreviewContainer) uploadPreviewContainer.style.display = 'flex';
            if (dropZone) dropZone.style.display = 'none';
        }

        // ---------- 预览图片加载测试 ----------
        function testImage(src, onLoad, onError) {
            const img = new Image();
            img.onload = onLoad;
            img.onerror = onError;
            img.src = src;
        }

        function updatePreviewAnimation() {
            let imageSrc = null;
            if (localImageBlobUrl) {
                imageSrc = localImageBlobUrl;
            } else {
                const url = imageUrlInput.value.trim();
                if (url) imageSrc = url;
            }

            if (!imageSrc) {
                if (previewSection) previewSection.style.display = 'none';
                removeDynamicStyle();
                if (previewError) previewError.textContent = '';
                return;
            }

            if (previewSection) previewSection.style.display = 'block';

            testImage(imageSrc,
                () => {
                    if (previewAnim) previewAnim.style.backgroundImage = `url("${imageSrc}")`;
                    if (previewError) previewError.textContent = '';
                    applyAnimationToPreview();
                },
                () => {
                    if (previewAnim) previewAnim.style.backgroundImage = 'none';
                    if (previewError) previewError.textContent = 'Failed to load image, please check the URL or file';
                }
            );
        }

        function applyAnimationToPreview() {
            try {
                const width = parseInt(widthInput.value, 10);
                const height = parseInt(heightInput.value, 10);
                const pixelated = pixelatedCheckbox.checked;
                const framesStr = framesInput.value.trim();
                const durationStr = durationInput.value.trim();
                const cycleMode = cycleModeSelect.value;

                if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) return;

                let frames, duration;
                try {
                    frames = framesStr.startsWith('[') ? JSON.parse(framesStr) : Number(framesStr);
                    duration = durationStr.startsWith('[') ? JSON.parse(durationStr) : Number(durationStr);
                } catch (e) {
                    return;
                }

                const totalFrames = Array.isArray(frames) ? frames.reduce((a,b)=>a+b,0) : frames;
                const totalDuration = Array.isArray(duration) ? duration.reduce((a,b)=>a+b,0) : duration;

                if (previewAnim) {
                    previewAnim.style.width = width + 'px';
                    previewAnim.style.height = height + 'px';
                    previewAnim.style.imageRendering = pixelated ? 'pixelated' : 'auto';

                    let animationValue = `${animNameInput.value || 'previewAnim'} ${totalDuration}s`;
                    if (!Array.isArray(frames) && totalFrames > 1) {
                        animationValue += ` steps(${totalFrames})`;
                    }
                    if (cycleMode === 'pingpong') {
                        animationValue += ` infinite alternate`;
                    } else {
                        animationValue += ` infinite`;
                    }
                    previewAnim.style.animation = animationValue;
                }
            } catch (e) {}
        }

        if (imageUrlInput) imageUrlInput.addEventListener('input', updatePreviewAnimation);

        // ---------- 更新输出框内容（根据 Minified 状态）----------
        function updateClassOutput() {
            if (!classOutput) return;
            if (minifyClassCheckbox && minifyClassCheckbox.checked) {
                classOutput.value = minifyCSS(originalClassCSS);
            } else {
                classOutput.value = originalClassCSS;
            }
        }

        function updateKeyframesOutput() {
            if (!keyframesOutput) return;
            if (minifyKeyframesCheckbox && minifyKeyframesCheckbox.checked) {
                keyframesOutput.value = minifyCSS(originalKeyframesCSS);
            } else {
                keyframesOutput.value = originalKeyframesCSS;
            }
        }

        // ---------- 生成按钮 ----------
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                clearAllErrors();

                const animName = animNameInput.value.trim();
                const className = classNameInput.value.trim();
                const width = parseInt(widthInput.value, 10);
                const height = parseInt(heightInput.value, 10);
                const imageUrl = imageUrlInput.value.trim();
                const pixelated = pixelatedCheckbox.checked;
                const framesStr = framesInput.value.trim();
                const durationStr = durationInput.value.trim();
                const cycleMode = cycleModeSelect.value;

                let hasError = false;

                if (!animName) {
                    showError('animName', 'Animation name cannot be empty');
                    hasError = true;
                }
                if (!className) {
                    showError('className', 'Class name cannot be empty');
                    hasError = true;
                }
                if (isNaN(width) || width <= 0) {
                    showError('width', 'Width must be a positive integer');
                    hasError = true;
                }
                if (isNaN(height) || height <= 0) {
                    showError('height', 'Height must be a positive integer');
                    hasError = true;
                }

                // 解析 frames
                let frames;
                try {
                    if (framesStr.startsWith('[')) {
                        frames = JSON.parse(framesStr);
                    } else {
                        frames = Number(framesStr);
                        if (isNaN(frames) || frames <= 0) throw new Error();
                    }
                } catch (e) {
                    showError('frames', 'Frames must be a positive number or a JSON array like [10,20]');
                    hasError = true;
                }

                // 解析 duration
                let duration;
                try {
                    if (durationStr.startsWith('[')) {
                        duration = JSON.parse(durationStr);
                    } else {
                        duration = Number(durationStr);
                        if (isNaN(duration) || duration <= 0) throw new Error();
                    }
                } catch (e) {
                    showError('duration', 'Duration must be a positive number or a JSON array like [1,0.5]');
                    hasError = true;
                }

                if (hasError) return;

                // 类型一致性校验
                if (Array.isArray(frames) !== Array.isArray(duration)) {
                    showError('frames', 'frames and duration must be both numbers or both arrays');
                    showError('duration', 'frames and duration must be both numbers or both arrays');
                    hasError = true;
                }
                if (Array.isArray(frames) && frames.length !== duration.length) {
                    showError('frames', 'frames and duration arrays must have same length');
                    showError('duration', 'frames and duration arrays must have same length');
                    hasError = true;
                }

                if (hasError) return;

                try {
                    const { classRule, keyframesRule } = generateAnimeCursorCSS({
                        animationName: animName,
                        className: className,
                        size: [width, height],
                        frames: frames,
                        duration: duration,
                        imageUrl: imageUrl,
                        cycleMode: cycleMode,
                        pixelated: pixelated
                    });

                    // 存储原始 CSS
                    originalClassCSS = classRule;
                    originalKeyframesCSS = keyframesRule;

                    // 根据复选框状态更新显示
                    updateClassOutput();
                    updateKeyframesOutput();

                    updatePreviewAnimation();

                    removeDynamicStyle();
                    const styleEl = document.createElement('style');
                    styleEl.id = dynamicStyleId;
                    styleEl.textContent = keyframesRule; // 注意：预览需要原始关键帧，不能压缩
                    document.head.appendChild(styleEl);

                    if (codeBox) codeBox.classList.remove('hide');

                } catch (error) {
                    showError('animName', error.message);
                }
            });
        }

        // ---------- Minified 复选框事件 ----------
        if (minifyClassCheckbox) {
            minifyClassCheckbox.addEventListener('change', updateClassOutput);
        }
        if (minifyKeyframesCheckbox) {
            minifyKeyframesCheckbox.addEventListener('change', updateKeyframesOutput);
        }

        // ---------- 开关代码显示 ----------
        if (switchCode && codeBox) {
            switchCode.addEventListener('click', () => {
                codeBox.classList.toggle('hide');
            });
        }

        // ---------- 复制功能（无弹窗，按钮状态反馈）----------
        function setupCopyButton(btn, textarea) {
            if (!btn || !textarea) return;
            let timeoutId = null;
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                const text = textarea.value;
                if (!text) return;
        
                navigator.clipboard.writeText(text)
                    .then(() => {
                        const originalText = btn.textContent;
                        btn.textContent = 'Copied';
                        btn.disabled = true;
        
                        if (timeoutId) clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => {
                            btn.textContent = originalText;
                            btn.disabled = false;
                            timeoutId = null;
                        }, 1000);
                    })
                    .catch(err => {
                        console.error('Failed: Browser too old!', err);
                    });
            });
        }

        setupCopyButton(copyClassBtn, classOutput);
        setupCopyButton(copyKeyframesBtn, keyframesOutput);

        window.generateAnimeCursorCSS = generateAnimeCursorCSS;
    }
})();