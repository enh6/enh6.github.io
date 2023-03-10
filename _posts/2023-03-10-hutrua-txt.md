---
layout: post
title: 小白笔记 - 用Cloudflare Workers糊一个小网站
author: enh6
categories: blog
---

自己有一个小需求，有个地方能临时的放笔记啊，小文件啊，在手机电脑各个设备上都能操作，方便记点东西，或者把文本或者文件从一个设备传到另一个设备上。在公司有一直开机的台式机，一个[php脚本](https://github.com/enh6/dumpster/blob/master/upload.php)都够用了。但公网一直用微信来发消息文件就很麻烦，所以就想自己糊一个。两年前糊了一个开头，这段时间又糊了糊，终于勉强能用了(已放在本站域名下，[link](https://www.hutrua.com/txt/list)，[repo](https://github.com/enh6/hutrua.txt))。

我挺喜欢[txti.es](https://txti.es/)这个网站，就模仿了这个网站的思路。我又不想搞VPS，就准备用[Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)来存数据，免费的足够我用了。Cloudflare Workers就是一个小function，接收`Request`返回`Response`，还能读写KV数据。Workers开发体验还不错，直接GitHub actions部署，也能用npm那一套东西，不过import两个库后，总共就几百行的代码build后的大小就从10K涨到100K了。

网站用Javascript来写，`Promise`和`async`这些东西早忘光了，重新看文档才回想起来。网站的HTML用了mustache模板，所有模板也都当作数据存到了KV里，所以可以线上直接修改。显示markdown文件也用了第三方库。KV可以设置失效时间，正好可以用来自动删除临时文件。第一次手写`set-cookie`设置一个简单的登录状态，又学到了。设计API也很麻烦，咱这完全不用json也是纯纯的SSR了(狗头)。虽然有的文件是登录才能看的，但代码逻辑很乱，说不定通过某个URL不登陆就直接看到了。。

