---
layout: post
title: 游戏中的 Web 引擎
author: enh6
categories: blog
---

(原载于[知乎](https://zhuanlan.zhihu.com/p/51290295))

{% include image.html title="pubg" img="pubg.jpg" %}

最近看了一个 CppCon 2018 的演讲[“OOP Is Dead, Long Live Data-Oriented Design”](https://www.youtube.com/watch?v=yy8jQgmhbAU)，是关于“面向数据设计”的。之前我也是通过一个非常精彩的[演讲](https://www.youtube.com/watch?v=rX0ItVEVjHc)知道了 DOD，对其追求 CPU 缓存命中率的编程方式印象深刻，所以就看了这个演讲。

DOD 是在游戏业界中诞生的，今年讲 DOD 的这个演讲者 Stoyan Nikolov，也是游戏业界的人，他的公司做的是游戏 UI 中间件。引起我兴趣的是其使用的技术，他们主要的产品Coherent GT 是基于 WebKit/chromium 用 HTML/CSS/JS 来做 UI 的，貌似在游戏业界基于 WebKit/chromium 来做 UI 也是挺常见的(例如 [PS4 的部分 UI 是用 WebGL 做的](https://news.ycombinator.com/item?id=6741442)。。)。在他们公司的官网上我还看到了一篇[博客](https://coherent-labs.com/posts/playerunknowns-battlegrounds-resurgence-pc-development-korea/)，说的是和蓝洞的合作，原来 PUBG 的 UI 就是用的他们的技术用 HTML/CSS 画出来的。

然后他们又开发了一款新的产品叫 Hummingbird，依然是用 HTML/CSS/JS 来做 UI 的，但是放弃了 chromium 内核，自己研发了一套 Web 引擎，用了 DOD 的设计思路，性能杠杠的，“完爆”chromium，当然功能还是比较有限的。演讲里 Stoyan 比较了 Chromium 使用 OOP 的架构和 Hummingbird 使用 DOD 思路的架构实现 CSS 动画的区别，还是很有意思的。

在 Stoyan 的个人博客上，我还看到了 Hummingbird 渲染引擎的[介绍](https://stoyannk.wordpress.com/2017/10/25/rendering-html-at-1000-fps-part-1/)[文章](https://stoyannk.wordpress.com/2017/11/13/rendering-html-at-1000-fps-part-2/)。Hummingbird 用的图形库 Renoir (相当于 Chrome 的 skia，Firefox 的 WebRender) 的思路其实和 WebRender 还是很相似的。用一个面向 GPU，更类似于游戏引擎的思路，不搞传统的 layer 结构和 paint + composite，整体的处理显示列表，尽量的 batch，减少 render pass，减少 draw call 和context switch。顺便说一句，WebRender 的核心开发者原来也是游戏业界的，渲染这块的发展看来还是靠游戏业来带动的。

用 Web 技术 HTML/CSS/JS 来写 UI 到底吼不吼呢？我觉的还是吼的，这是广大开发者所熟悉的技术。从各种浏览器/各种 WebView，到 electron/Sciter，到 React Native/Weex，到游戏UI... 我想“大前端”还是有前途的。
