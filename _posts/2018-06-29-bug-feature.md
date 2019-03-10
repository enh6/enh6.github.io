---
layout: post
title: 这不是bug，这是个feature？
author: enh6
date: 2018-06-29
categories: blog
---

自从知乎几个月前强推客户端，限制手机网页版的浏览后，我只好在手机上请求桌面版网站来看帖了。但我在Chrome安卓版上遇到了一个很讨厌的问题。

我常用zhihu.com/search这个老版的页面搜索关键词，然后点搜索建议里的问题页面，然后点“桌面版网站”，看所有的回答。但在当前标签页打开页面的时候，点“桌面版网站”会回到zhihu.com/search的桌面版。只有在新标签页打开时，点“桌面版网站”才会正常加载问题页面的桌面版。

{% include image.html title="Zhihu search" img="zhihu.png"
   caption="移动端的知乎搜索页面" %}

在被这个问题恶心了几个月后，我终于受不鸟了，决定看看到底是什么原因。

于是乎我先用火狐安卓版试了一下，“要求桌面版网站”没有这个问题。

难道是Chrome的bug？于是乎我把手机连上DevTools，看看这里是怎么跳转的。看了以后发现，当前标签页内的跳转是通过改`location.href`来完成的。

难道是改`location.href`引起的问题么？于是乎我试了打开`a.com`，然后再console里改`location.href`跳转到`b.com`，再点“桌面版网站”。果然重新加载了`a.com`的桌面版。

为什么Chrome有这样的行为呢？于是乎我看了一下Chrome的相关代码。点击“桌面版网站”后发生的故事很简单，首先把User Agent切换成桌面版本，然后重新加载页面。唯一一点值得注意的是重新加载页面时传入了一个叫做`ORIGINAL_REQUEST_URL`的标志。

这个标志只在这一个地方使用过，从名字来看就是它导致了我遇到的问题。难道说。。这不是bug，这是个feature？于是乎我继续往下看，在`ORIGINAL_REQUEST_URL`定义的[注释里找到了](https://cs.chromium.org/chromium/src/content/public/browser/reload_type.h?q=original_request_ur)这个标志的用处。

这里我用一个实际的例子来说明。Chrome安卓版访问`www.hupu.com`，页面会根据User Agent改`location.href`自动重定向到`m.hupu.com`。这时候点“桌面版网站”，Chrome就会机智的重新加载原始请求的URL的桌面版，也就是`www.hupu.com`。而Firefox就只会用桌面版样式重新加载`m.hupu.com`。（当然Chrome直接访问`m.hupu.com`然后点“桌面版网站”也是不会加载`www.hupu.com`的。）

现在，我所遇到的讨厌的问题的原因已经找到了。修改`location.href`不会改变原始请求的URL，而点击“桌面版网站”会重新加载原始请求的URL。

那么这个问题的锅谁来背？首先知乎是逃不了的。把点击链接的操作给`preventDefault()`了然后再改`location.href`，才造成了这个问题，好气啊👿。StackOverflow上有一个[比较点击链接和修改location.href的问题](https://stackoverflow.com/questions/1667416/window-location-href-vs-clicking-on-an-anchor)，高票答案说点击链接更好，我算是亲身体验到了。

另外一个问题就是改`location.href`的意义是什么？是重定向redirect还是正常的页面跳转navigation，还是都行？这里Chrome是把它当作重定向来处理的，其它地方我也没有研究。所以说这是一个feature还是一个bug呢？我也没有答案。
