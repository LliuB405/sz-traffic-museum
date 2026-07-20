/**
 * ============================================================
 *  深圳改革开放交通发展数字博物馆 - 导航高亮逻辑
 *  文件：js/nav.js
 *  功能：根据当前页面URL自动为对应导航链接添加激活态样式
 *  用法：在</body>前引入，DOMContentLoaded时自动执行
 * ============================================================
 */

(function () {
    'use strict';

    /**
     * 导航高亮初始化
     * 策略：获取当前页面文件名，与导航链接href比对，匹配项添加激活类
     */
    function initNavHighlight() {
        // ---- 1. 获取当前页面文件名 ----
        // 从完整路径中提取文件名，例如 "/index.html" → "index.html"
        var path = window.location.pathname;
        var currentPage = path.substring(path.lastIndexOf('/') + 1);

        // 处理访问根路径的情况：例如访问 "/" 或 "/museum/" 时默认匹配首页
        if (currentPage === '' || currentPage === '/') {
            currentPage = 'index.html';
        }

        // ---- 2. 获取所有导航链接 ----
        var navLinks = document.querySelectorAll('.museum-nav__link');

        // 如果没有找到导航链接（防御性编程），直接退出
        if (!navLinks || navLinks.length === 0) {
            return;
        }

        // ---- 3. 遍历比对并设置激活态 ----
        var matched = false;

        navLinks.forEach(function (link) {
            // 获取链接的href属性值
            var href = link.getAttribute('href');

            if (!href) {
                return; // 跳过空链接
            }

            // 提取href中的文件名（去掉可能的路径前缀和锚点）
            var linkPage = href.split('/').pop();  // 取最后一段
            linkPage = linkPage.split('#')[0];      // 去掉锚点
            linkPage = linkPage.split('?')[0];      // 去掉查询参数

            // 比对：当前页面文件名 === 链接目标文件名
            if (currentPage === linkPage) {
                link.classList.add('museum-nav__link--active');
                matched = true;
            }
        });

        // ---- 4. 兜底：若未匹配到任何链接，默认激活首页 ----
        if (!matched && navLinks.length > 0) {
            // 尝试匹配第一个链接（通常是首页）
            navLinks[0].classList.add('museum-nav__link--active');
        }
    }

    /**
     * 绑定键盘导航辅助（无障碍增强）
     * 为导航链接添加键盘焦点指示
     */
    function initKeyboardNav() {
        var navLinks = document.querySelectorAll('.museum-nav__link');

        navLinks.forEach(function (link) {
            // 确保链接可通过键盘聚焦
            if (!link.getAttribute('tabindex')) {
                link.setAttribute('tabindex', '0');
            }

            // Enter键激活链接（部分浏览器对非<a>元素不自动响应Enter）
            link.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    var href = link.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                }
            });
        });
    }

    // ---- DOM加载完成后执行 ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initNavHighlight();
            initKeyboardNav();
        });
    } else {
        // DOM已加载完毕，直接执行
        initNavHighlight();
        initKeyboardNav();
    }

})();
