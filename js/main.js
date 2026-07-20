/**
 * ============================================================
 *  深圳改革开放交通发展数字博物馆 - 全局交互逻辑
 *  文件：js/main.js
 *  功能：入场滚动动画、ECharts骨架初始化、全局工具函数
 *  依赖：需在ECharts CDN之后引入（仅chart.html和map.html需要ECharts）
 * ============================================================
 */

(function () {
    'use strict';

    /**
     * ============================================================
     *  一、滚动入场动画（Intersection Observer）
     *  为带有 .anim-fade-up 类的元素添加滚动到视口时的淡入上移动画
     * ============================================================
     */
    function initScrollAnimations() {
        // 获取所有需要动画的元素
        var animatedElements = document.querySelectorAll('.anim-fade-up');

        // 如果没有需要动画的元素，直接返回
        if (!animatedElements || animatedElements.length === 0) {
            return;
        }

        // 检查浏览器是否支持 IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            // 不支持时，直接显示所有元素（降级处理）
            animatedElements.forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        /**
         * 创建观察器
         * 配置：元素进入视口20%时触发动画
         */
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    // 当元素进入视口时
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // 动画只播放一次，触发后取消观察
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,       // 元素20%可见时触发
                rootMargin: '0px 0px -50px 0px' // 底部提前50px触发（视觉上更流畅）
            }
        );

        // 开始观察所有动画元素
        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /**
     * ============================================================
     *  二、ECharts 图表骨架初始化
     *  当页面存在图表容器时，初始化ECharts实例并设置占位配置
     *  后续可在此函数中扩展具体图表的配置项
     * ============================================================
     */

    /**
     * 初始化单个ECharts图表容器
     * @param {string} containerId - 图表容器的DOM ID
     * @param {Object} [option]     - 可选的图表配置项（骨架阶段仅设占位）
     * @returns {Object|null}       - 返回ECharts实例，或null（初始化失败时）
     */
    function initChartInstance(containerId, option) {
        // 获取容器DOM
        var container = document.getElementById(containerId);
        if (!container) {
            console.warn('[博物馆] 图表容器 #' + containerId + ' 未找到，跳过初始化');
            return null;
        }

        // 检查ECharts是否已加载
        if (typeof echarts === 'undefined') {
            console.warn('[博物馆] ECharts库未加载，#' + containerId + ' 无法初始化');
            // 在容器中显示提示信息
            container.innerHTML = '<div class="chart-box__placeholder">' +
                '<div class="chart-box__placeholder-icon">📊</div>' +
                '<div class="chart-box__placeholder-text">图表库加载中，请检查网络连接</div>' +
                '</div>';
            return null;
        }

        // 初始化ECharts实例
        var chart = echarts.init(container);

        // 默认占位配置（骨架阶段）
        var defaultOption = {
            title: {
                text: '数据加载中...',
                subtext: '图表功能即将上线',
                left: 'center',
                top: 'center',
                textStyle: {
                    color: '#8C8C8C',
                    fontSize: 18,
                    fontFamily: '"KaiTi", "STKaiti", serif'
                },
                subtextStyle: {
                    color: '#B8A288',
                    fontSize: 14,
                    fontFamily: '"Microsoft YaHei", sans-serif'
                }
            },
            // 空数据，仅展示标题
            xAxis: { show: false, data: [] },
            yAxis: { show: false },
            series: []
        };

        // 使用传入的配置或默认占位配置
        chart.setOption(option || defaultOption);

        // ---- 窗口大小改变时自动重绘 ----
        window.addEventListener('resize', function () {
            chart.resize();
        });

        return chart;
    }

    /**
     * 页面级图表初始化入口
     * 自动检测页面中的图表和地图容器并初始化
     */
    function initPageCharts() {
        // 初始化数据图表（chart.html 中）
        var chartInstance = initChartInstance('chart-container');

        // 初始化地图容器（map.html 中）
        // 地图可能是ECharts地图，也可能是静态图片展示
        // 本次骨架阶段：地图使用CSS背景图展示，此处预留ECharts地图初始化入口
        var mapContainer = document.getElementById('map-container');
        if (mapContainer && typeof echarts !== 'undefined') {
            // 预留给后续地图交互功能使用
            // var mapChart = echarts.init(mapContainer);
            // mapChart.setOption({ ... });
            console.log('[博物馆] 地图容器 #map-container 已就绪，等待后续交互功能接入');
        }

        // 将chart实例挂载到全局，方便后续调试和扩展
        if (chartInstance) {
            window._museumChart = chartInstance;
        }
    }

    /**
     * ============================================================
     *  三、图片懒加载（基础实现）
     *  对展品图片进行按需加载，提升首屏速度
     * ============================================================
     */
    function initLazyImages() {
        // 检查浏览器是否支持 loading="lazy" 属性（原生懒加载）
        // 现代浏览器均已支持，此处作为渐进增强
        var images = document.querySelectorAll('.exhibit-frame__image');

        images.forEach(function (img) {
            // 如果图片没有设置 loading 属性，补充设置
            if (!img.getAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }

    /**
     * ============================================================
     *  四、页面初始化入口
     *  在DOM加载完成后统一执行
     * ============================================================
     */
    function init() {
        initScrollAnimations();     // 入场动画
        initPageCharts();           // 图表骨架
        initLazyImages();           // 图片懒加载
    }

    // ---- DOM加载完成后执行 ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM已就绪，直接执行
        init();
    }

})();
