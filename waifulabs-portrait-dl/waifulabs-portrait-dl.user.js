// ==UserScript==
// @name         WabfuLabs Portrait DL
// @namespace    https://github.com/
// @version      1.0.0
// @description  为WaifuLabs生成的无水印预览图标添加下载功能 (200x200)
// @author       kazemichi
// @match        https://waifulabs.com/generate
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waifulabs.com
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    GM_addStyle(`
        /* 底部下载浮层 */
        .download-bar {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 40px;
            background: rgba(0,0,0,0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            visibility: hidden;
            transition: bottom 0.5s ease;
        }
        /* hover时浮层上移显示 */
        .waifu-grid>div:hover .download-bar {
            visibility: visible;
        }
        /* SVG下载图标样式 */
        .download-icon {
            width: 20px;
            height: 20px;
            fill: #fff;
            pointer-events: none;
        }
    `);

    /**
     * 下载 base64 图片
     * @param {str} base64Str 图片的base64编码字符串
     */
    function downloadBase64Image(base64Str) {
        // 创建 a 标签
        const a = document.createElement('a');
        a.href = base64Str;
        a.download = `WaifuLabs-Portrait.png`;

        // 触发点击
        document.body.appendChild(a);
        a.click();
        // 清理dom
        document.body.removeChild(a);
    }

    /**
     * 为每张图片添加下载按钮
     */
    function addDownloadBtn() {
        let grid = document.querySelectorAll('div.waifu-grid > div > div > div');
        // 排除最后一张随机生成
        for (let i = 0; i < grid.length - 1; i++) {
            let downloadBar = document.createElement('div');
            downloadBar.className = 'download-bar';
            let downloadIcon = `<svg class="download-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`
            downloadBar.innerHTML = downloadIcon;
            grid[i].appendChild(downloadBar);

            // 添加点击事件
            downloadBar.addEventListener('click', (e) => {
                e.stopPropagation();

                // 执行下载逻辑，不触发图片的点击
                let cur = e.target;
                let all = cur.parentElement.children;
                for (let node of all) {
                    if (node != cur && node.children.length) {
                        let firstChildDiv = node.querySelector('div');
                        let bgBase64Str = getComputedStyle(firstChildDiv).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];
                        downloadBase64Image(bgBase64Str);
                    }
                }
            })
        }
    }

    // 创建监听
    const targetDom = document.querySelector('div.waifu-grid');
    const observerConfig = { childList: true };

    const observer = new MutationObserver(addDownloadBtn);
    observer.observe(targetDom, observerConfig);

    // 销毁监听
    window.addEventListener('beforeunload', () => {
        observer.disconnect();
    });
})();