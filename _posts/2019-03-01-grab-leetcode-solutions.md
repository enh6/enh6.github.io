---
layout: post
title: 小白笔记 - 从leetcode下载AC代码
author: enh6
date: 2019-03-01
categories: blog
---

## WHY

一年前，我在leetcode上重新开档刷题；到今年，已经做了一百多道题。我在Github上也建了一个[repo](https://github.com/enh6/leetcode)来存放做题记录。所以每次在leetcode网站上做了几题以后，我会再把代码复制到本地的repo中。

几百次的无脑复制粘贴操作后，我迟钝的大脑终于产生了一个不同的想法：为何不写个脚本自动抓取提交的代码呢？从效率上来讲，写脚本会花几个小时，使用脚本也节省不了几个小时，并无卵用。但从精神上来讲，作为一个小目标，学一下以前没接触过的从网上抓取数据的操作，获得一点人生经验，<del>甚至可以水一篇博客，</del>还是值得一做的。

## HOW

我决定用python来写，因为简单。首先需要一个库来方便开发。请教了一下朋友，朋友推荐requests，于是我就无脑用了requests。

然后就开始干活了。思路是先模拟登录，再通过API获得题目信息和提交信息，然后通过API获得提交的代码，完事儿。

第一步是模拟登录。用浏览器的DevTools看一下登录的网络请求，登录就是POST提交表单，然后返回成功登录的cookie。以后发的请求稍带着cookie，就能获得登录后的信息了。用requests库的`session`类可以保持cookie登录状态，所以就不用手工来设置了。而登录的提交除了用户名密码，还有一个隐藏项，要填进去一个叫做`csrfmiddlewaretoken`的cookie。无奈只能先GET登录页面拿到这个cookie，再POST登录。

第二步是通过API获得题目信息和提交信息。依然是先用DevTools看，发现leetcode通过GraphQL API查询这些信息。把DevTools里看到的json格式的获取题目列表和提交列表的query复制过来发送，果然得到了json格式的题目信息和提交信息。

第三步是获得提交代码。我并没有发现直接获得提交代码的GraphQL API，只看到提交详情HTML页面里的一个script标签里的json对象里有提交代码。无奈只能先抓页面再从里面提取了。迫于正则知识匮乏，研究了一番才把提交代码匹配出来。另外这个代码字符串还是unicode转义编码过的，搜索一番才发现转换回来的方法(`bytes(string, 'ascii').decode('unicode-escape')`)。

## WHAT

最终成果就是这个了：[https://github.com/enh6/leetcode/blob/master/grab_solutions.py](https://github.com/enh6/leetcode/blob/master/grab_solutions.py)。测试了一下，单线程下载速度挺慢，但至少能用了，下载的内容和原来手工复制的一样，小目标完成✌～
