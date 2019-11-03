---
layout: post
title: 胡乱写写 - 开发一个浏览器有多难
author: enh6
categories: blog
---

(原载于[知乎](https://zhuanlan.zhihu.com/p/31763298))

最近有一篇博客在 HN 上引起了[许多讨论](https://news.ycombinator.com/item?id=15836027)。这篇博客讲的是为什么 Mozilla 的主要产品仅仅是一个浏览器，就需要有 1200 名员工。开发维护一个浏览器需要这么大的投入吗？答案是真的需要。

目前全世界满打满算，只有四家有自己的 Web 引擎和 JavaScript 引擎的独立的浏览器厂商，其中三家是全球市值前十的 IT 巨头，一般人玩不起啊。而这四家的浏览器引擎的历史都可以追溯到十几年前。据我所知，近十几年来没有从零开始开发做大的浏览器项目，至多是从已有的项目 fork 出来( KHTML -> WebKit -> Blink, Trident -> EdgeHTML)。

- 谷歌 / Chrome / Blink内核 / V8
- 苹果 / Safari / WebKit内核 / JavaScriptCore
- 微软 / Edge / EdgeHTML内核 / Chakra
- Mozilla / Firefox / Gecko内核 / SpiderMonkey

这篇文章里我们不提到底需不需要这些个独立的浏览器，只说说开发一个独立的浏览器需要多大投入。

## 大型软件

任何大型软件工程项目都是需要巨大投入来维持的。浏览器也是一个复杂的软件工程项目，复杂度不亚于操作系统。

开发浏览器需要实现哪些东西呢？嗯，大概有：Web 标准的实现。对多媒体的支持，视频播放。图形显示。各种文字的显示。GPU 渲染，流畅的滚动和动画。网络。HTTPS, SSL, HTTP/2, HSTS, DNS 等玩意儿。跨平台支持。需要运行在 Windows / Android / MacOS 操作系统上，需要支持x86, x64, Arm, Arm64 的 CPU，需要支持各种硬件，解决或者绕过各种 GPU 的各种 bug。安全性。实现沙盒模型，多进程模型。CORS。预防网络攻击和钓鱼，保护用户安全和隐私。性能优化，内存使用的优化，程序大小的优化，耗电量的优化。激烈的竞争下，用户体验和性能优化是很重要的方面，需要投入许多。此外还有 Headless 模式的支持，开发者工具，扩展和插件系统，pdf显示等。(当然，许多功能特性并不是必须要有的。)

这么多东西塞在一起，保持项目正常运行，可维护， 能开发新功能，实在是一个大工程。

## Web 标准有多少？

浏览器需要兼容老的Web标准。几十年前的网页现在依然可以浏览，不得不说是Web的一个巨大成就。

其次新的Web标准层出不穷，标准也会不断更新，导致Web平台的复杂度突破天际：HTML, CSS, JS, DOM, Canvas2D, WebGL, WebGL2，IndexDB，WebRTC，Web Audio/Video, WebCL, Web Storage, File API, WebSocket, Web worker, WebVR, WebUSB, Payment, WebAssembly, SVG, Media Capture, MathML, CSS Flexbox, CSS grid layout, HTTP2… 去W3C官网上看看，Recommendation 的标准就[上百个](https://www.w3.org/TR/)。(当然，许多功能特性并不是必须要有的。)

罗马不是一天建成的，实现这些标准，解决各种bug，处理各种边边角角的问题，让所有依赖这些标准的网站正常工作，需要大量的时间积累和持续不断的投入。

## 开发 Chrome 用了多少人

作为市场份额第一大浏览器，Chrome 的开发人员应该比 Firefox 的人多不少。谷歌员工好几万，直接或者间接参与 Chrome 开发的有几千也是很正常的。此外还有其他公司如 Opera，三星，英特尔，igalia的人参与开发。

我非常粗略的统计了一下一年以来向 Chromium 主 repo chromium/src 提交过代码的人数。

```
git log --format="%ae" --since="1 year" | cut -d @ -f1 | sort | uniq -c -i | sort -g -r | nl | less
```

由于许多人会同时使用 chromium.org 和 google.com 的邮箱，所以只根据邮箱的用户名来统计。大概有近一千人在一年内提交过十个或十个以上的 patch。

此外，还有许多其他的项目其实也属于或者部分属于 Chrome。包括 V8, skia, ANGLE, catapult, pdfium 等。这些也需要人手来开发。

此外，Chrome 自己用的各种工具和基础设施也有很多，包括构建工具 gyp, gn, ninja, 代码浏览 cs.chromium.org, bug 管理系统 Monorail，代码审查系统 Rietveld 和 Gerrit, Fuzzing 工具，CI 系统 LUCI，性能测试监测系统 chromeperf.appspot.com 等。

总的加起来，感觉进行 Chrome 以及相关项目的开发测试人员确实得几千人。

## 结语

列了这么多乱七八糟的东西，其实就一个意思：开发浏览器挺难的。
