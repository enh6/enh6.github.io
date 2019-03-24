---
layout: post
title: 日志加密，在开放环境中自闭
author: enh6
categories: blog
---

### <span class='hid' data-text='U2FsdGVkX1/Bo2DYoPvJ/6g/1VxoP2Edb9U/0j5qzZGpuNVLwUboZB0XuOG0ADTG'>\*\*\*\*encrypted text\*\*\*\*</span>

<span class='hid' data-text='U2FsdGVkX18doAZ5MWZHkAMI99sXYRnLe5q8v1C2OdhqrpvWeRIZVhDMP2ltRFLZIyJL0YJk76Xb6Ftwu59eomnxij6qmK1oFQTdZ3FYXIH0JWRfUITRnxgTBIigxYIdirxJ1zLTMDnF2llrAebSmA=='>\*\*\*\*encrypted text\*\*\*\*</span>

<span class='hid' data-text='U2FsdGVkX1+7Pr3Stvq4mvggxQVQnxrNwmifwCwv6r6rOGSZSvOTHiCqXTlfsBmi/9R8OcIBMBLQQO6BQDdydHzuONQg63HmIvApNSnYThQEHI/DZG7p0vAzSmqQ3n27Lndnuxv7tCsYAl//2Ath9Pxb3z8SLc+NLyD7U3cgyVhUfBB8ynX+84XljnPHh3q4+5jRIBjJW0vNe8lZa/Y0xO+di0NH332/beeGmsIXyFLrP6igcyUwqpWPKNKBM30cUuy4xGPcVhEvoOt+bpQTtSXocz9OcMUbPQJjJrh31RI='>\*\*\*\*encrypted text\*\*\*\*</span>

### 或者来这里？

有些内容更适合发在朋友圈或者豆瓣，但谁知道说不定哪天号就没了呢？我需要免于恐惧的自由。Github上搭建的个人博客可以由我自己掌控，那就都放这里？但这里的代码和内容全是静态和公开的，不能设置访问权限。而且个人向的内容和吐槽与“技术”博客也不太搭。于是我就想了一个主意，加密部分内容，仅自己可见，但也可以分享给别人看到。

### 实现介绍

我实现的方法其实很简单，把不想公开的内容加密后再上传到Github上，然后在页面中这些内容需要密码才能看到。代码只有一个JavaScript文件`hid.js`，可以作为node脚本运行，加密/解密日志markdown文件，方便写日志。`hid.js`也包含在了页面中，浏览器环境下可以自动显示加密的内容。

加解密我用了CryptoJS的AES算法，只要密码够长应该还算安全。而密码就是URL的hash字段，这样只要发送正确的URL就可以分享加密的内容。而且hash字段不会通过网络请求发送，所以更难泄漏一点。写日志也还算方便，只需要把想要加密的内容套一个`span`，加上`.hid`类就好了。

### 完成自闭

好了，现在就可以开心的在开源repo中完成自闭姿势了。这一篇日志只是一个测试，密码是`123456789`，所以加密的内容其实大家都能看的到啦。<span class='hid' data-text='U2FsdGVkX1+HxpEbSUifMJgotGBHomm3F+lg9goRl534aWDT69uUI2TrpNy/lU803XnLeFAwQz8Ta4iBg2HKcSQqV0neii3JPlKBUQaRzUtUFGwT0C9uuAW+TIPnQrQK'>\*\*\*\*encrypted text\*\*\*\*</span>

<script src='/assets/js/hid.js' defer></script>
