---
layout: post
title: Unicode文本中加入水印的方法
author: enh6
categories: blog
---

Unicode十分的复杂，以至于“纯文本”也能玩出各种花样来。这里介绍一些在Unicode文本中悄咪咪的加入一些奇怪的东西，但不改变显示效果或很难看出区别的方法。这些方法可以用来作为文本的水印，作为别人复制你的文本的“证据”。

我经常用[这个小工具](https://bencrowder.github.io/unicode-inspector/)来看Unicode文本的信息。用它可以看出来下面的示例中的Unicode编码的不同。

## 1. 插入零宽字符

一种常见方法是加入一些看不见的字符，比如宽度为零的空格zero-width space `U+200B`，zero-width joiner`U+200D`, zero-width non-joiner`U+200C`。例如`你好`和`你​好`其实是不一样的。

零宽空格在移动光标的时候会露馅：光标在零宽空格处会顿一下。而另外两个字符会影响换行的处理。

## 2. 同形字（homoglyph）替换

Unicode中有同一个字符对应多个不同的码位的情况。中文文本中，正常的汉字在CJK Unified Ideographs区块中，如`力`（`U+529B`)。但在CJK Compatibility Ideographs区块中也有`力`（`U+F98A`）这个字。而力作为部首，在Kangxi radical区块中也有一个专门的码位：`⼒`（`U+2F12`）。很多字体里这些字符都是长的一模一样的。

不同的软件处理这些字的方式也是不同的。用百度搜索这三个力，会返回不同的结果。而谷歌对前两个力一视同仁，只区别对待部首。Chrome浏览器页面查找力字会找到全部三个力，而Firefox浏览器就不行，只能找到码位相同的那个。

更多的例子可以参考Unicode官网上的[容易混淆的字符列表](https://www.unicode.org/Public/security/latest/confusables.txt)。

## 3. 等价字符

西文中有声调的字符可以用单个字符表示也可以用字符加声调组合表示。例如`café`中的`é`，可以用单个字符`é`（`u+00E9`)表示，也可以用`e`加上音调`U+0301`来表示(`é`)。

Unicode正规化（normalization）可以把等价字符转换为完全一样的字符。这里正好是反其道而行之。

## 4. 各种空格

Unicode中有各种各样，各种宽度的空格，总共有[一二十种](https://en.wikipedia.org/wiki/Whitespace_character#Unicode)之多。把正常的空格替换为其他的空格还是很难被发现的。

## 5. 调整文字方向

Unicode支持不同的文字书写方向。Right-to-Left Override字符`U+202E`和Pop Directional Format字符`U+202C`配合可以改变文字书写方向。例如从右向左写的`人好个是你`就变成`‮人好个是你‬`了，看起来和`你是个好人`是一样的。

这个方法会在选择文本时露馅：方向不对了。而且在换行的情况下也会显示错误的文字顺序。

## 6. <del>Surrogate Pair</del>

Unicode基本平面BMP以外的字符，也就是无法用两个字节表示的字符，可以用两个基本平面内的Surrogate字符来表示。例如emoji字符就在基本平面外，😀（`U+1F600`）可以用Surrogate Pair`U+D83D`加`U+DE00`表示。

然而，Surrogate Pair只能在UTF-16编码中使用，在其他编码如UTF-8中是无效的；而正常编码的码位超过了两字节，无法在UTF-16编码中表示。所以这个方法并不可行。
