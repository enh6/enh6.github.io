---
layout: post
title: 中英混排中的标点符号问题
author: enh6
categories: blog
---

写技术方面的文章，很难避免中文混杂英文的情况，这就涉及到了如何排版的问题。专业的文字排版软件可以精细的调整字距，但在纯文本环境下，如在代码编辑器中编辑代码注释，或者在文本编辑器中编辑markdown格式的文档，以及在排版能力较弱的环境下，如Web页面中，如何排版并没有公认的最优解。关于中英混排的规范，网上已经有许多讨论和比较好的实践，例如[中文文案排版指北](https://github.com/mzlogin/chinese-copywriting-guidelines)。至于中英混排中如何使用标点符号的问题，我有一些自己的审美和想法。这些想法可能并不正确，也可能以后自己都不再认可了，但我觉得还是值得记录一下的。

## 标点的基础知识

Unicode的世界中包含了非常多的标点符号。这里我先分类总结一下在Unicode中，英文和中文常用的标点。

Unicode中的字符会根据其类别分步在不同的区块中。常用的标点分布在下面四个区块中：

1. [`C0 Controls and Basic Latin`](http://www.unicode.org/charts/PDF/U0000.pdf)区块，码位`U+0000`至`U+007F`，也就是ASCII码对应的区块。这个区块包含了电脑键盘上所有的字母数字以及符号。

{% include image.html title="Unicode Basic Latin block" img="punctuation-unicode-1.png" %}

   英文中的逗号`,`，句号`.`，分号`;`，冒号`:`，问号`?`，感叹号`!`，小括号`()`都在这一区块。还有不分左右的直的双引号`"`和直的单引号兼撇号`'`。

2. [`General Punctuation`](http://www.unicode.org/charts/PDF/U2000.pdf)区块，码位`U+2000`至`U+206F`。这个区块包含了英文中所需要的，而ASCII码中没有覆盖到的标点符号。

{% include image.html title="Unicode General Punctuation block" img="punctuation-unicode-2.png" %}
   弯的单引号`‘’`，双引号`“”`，省略号`…`，以及英文中的“dash”，中文里的破折号等都在这一区块。而英文的撇号`’`和单引号也是占用同一个码位。这个区块中的标点的特点是：中英文的同一标点用的是同一个码位。

3. [CJK Symbols and Punctuation](http://www.unicode.org/charts/PDF/U3000.pdf)区块，码位`U+3000`至`U+303F`。这个区块包含了中日韩文字中特有的标点符号。

{% include image.html title="Unicode CJK Symbols and Punctuation block" img="punctuation-unicode-3.png" %}
   中文中的句号`。`，顿号`、`，直角引号`「」『』`，书名号`《》〈〉`，方括号`【】〖〗`等都在这一区块。由于这些标点是中日韩文字中特有的，所以默认是全宽的，也就是占一个汉字的宽度的。

4. [Halfwidth and Fullwidth Forms](http://www.unicode.org/charts/PDF/UFF00.pdf)区块， 码位`U+FF00`至`U+FFEF`。这个区块包含了全宽的ASCII字符，还有半宽的也就是占半个汉字宽度的中文标点。

{% include image.html title="Unicode Halfwidth and Fullwidth Forms block" img="punctuation-unicode-4.png" %}

   中文中的逗号`，`，感叹号`！`，问号`？`，分号`；`，小括号`（）`等都在这一区块。与`General Punctuation`区块不同，这些和英文长的一样的标点有和英文不同的码位。

从上面的介绍可以看到，中文的标点符号横跨了三个区块，就连最基本的句号，逗号，引号都不在一个地方。

## 中文标点宽度的问题

除了形状的差异，中英文标点最大的差异就是宽度，也就是字距的差异。英文中有空格这个东西，而中文中没有这个概念。英文的标点的宽度就是标点自己的宽度，需要间距可以加空格。而中文标点的一般都设计成占一个汉字的空间，而国内标准中标点位置在这个空间的一个半边，相当于另一个半边自带空格。所以在中文的排版中，虽然没有输入空格，但是你能看到句子之间有很明显的空格。

以前中文的书写和排版都是密排的，现在加入了标点和空隙，是一大进步。这种变化应该是借鉴于英文，英文中句子结尾会加一个标点和空格。

而中文中的这些空隙与英文也有不同之处。英文由单词组成，每个词之间都有空格。英文排版的视觉是比较流畅的线性的，标点符号很小，不会引起注意，句子与句子之间的区分不明显。而中文的标点符号和空隙在视觉上非常明显，可以很清晰的看到由标点所分隔的一个一个句子。例如下图中[纽约时报中文网中英双语新闻](https://cn.nytimes.com/technology/20180719/china-trade-tech/dual/)的效果：

{% include image.html title="NYT CN example" img="punctuation-nytcn.png" %}

中文用全宽的标点分隔出句子的结构，起到了挺好的效果。当然在句子平均长度很短的时候也不是那么美观。例如下图中《三国演义》的效果。这时候我就觉得空隙太大、太多了，造成版面断断续续的。当然，专业排版可以进行标点挤压、标点悬挂，这只是随便找的网页上的“野生”的例子。

{% include image.html title="Three Kingdom example" img="punctuation-three-kingdom.png" %}

还有一种情况在我看来也是有问题的。有些标点并不是对句子的分隔，而是在句子内部使用，如括号书名号等。这些符号不应该加入和句号逗号一样的空隙，不然会有断断续续的感觉。例如下图中使用Latex排版的《游戏引擎架构》一书的效果。括号的空隙十分扎眼，句子的内部不应该需要这么大的空隙。只有第三行那个和句号没有空隙的括号看起来顺眼一些。

{% include image.html title="Game Engine Architecture example" img="punctuation-gea.jpg" %}

所以在没有专业排版支持的情况下，我觉得选择英文的括号的显示效果可能更好。下面是《设计模式》一书混用中英文括号的效果。我觉得是英文的括号更舒服。当然，英文的基线比中文的低，所以英文的括号等标点的位置是偏下的，这点也需要注意。括号里是英文的话，配英文的括号还是很搭配的。

{% include image.html title="Design Pattern Pattern example" img="punctuation-dp.jpg" %}

我就喜欢用英文的括号而不是中文的括号。

## 引号的问题

由于中英文共用同一个引号，所以引号显示效果会由字体来确定，可能显示为全宽，也可能显示为半宽，这就造成了不确定性。这也造成了英文中出现诡异的撇号(上面纽约时报的例子里就有这种现象)。也不知道为什么Unicode没有加进去全宽的弯引号。

于是有人就提出，中文的排版要使用中文的直角引号。这种引号可以确定是全宽的。

在我看来直角引号确实很好看，更适合中文。只是引号里是英文的话，感觉就有点怪异了。如[中文文案排版指北](https://github.com/mzlogin/chinese-copywriting-guidelines#%E9%81%87%E5%88%B0%E5%AE%8C%E6%95%B4%E7%9A%84%E8%8B%B1%E6%96%87%E6%95%B4%E5%8F%A5%E7%89%B9%E6%AE%8A%E5%90%8D%E8%AF%8D%E5%85%B6%E5%85%A7%E5%AE%B9%E4%BD%BF%E7%94%A8%E5%8D%8A%E8%A7%92%E6%A0%87%E7%82%B9)里的例子：

{% include image.html title="Chinese Copywriting Guildlines example" img="punctuation-ccg.png" %}

也有一种方法就是遇到英文换英文弯引号，例如[TIB网站](https://thetype.com/2017/10/13558)里的例子：

{% include image.html title="Type is Beautiful example" img="punctuation-tib.png" %}

相比之下，我觉得还是全用直角引号好一点吧。

## 使用英文风格的标点

中英混排，大部分情况是以中文为主，只有部分词语或者句子是英文，如括号里放英文原文，引用一句英文的句子等。目前常见的用法都是全篇用中文标点，只有在英文的整句等特殊的地方里用英文标点。这种用法就是会混用中英文的标点符号。

如果对有时候使用中文标点，有时候使用英文标点感到不爽，还有一个方案是全部使用英文标点加空格，或者是只用ASCII中的标点。这样可以避免各种标点混用的情况，自己控制标点的空隙。而且对程序员来讲，尽量避免在文本中使用ASCII之外的符号也是很好的实践。但缺点是让人看着不太习惯。网上是有人这么用标点的，就像下面这样：

{% include image.html title="cp example" img="punctuation-cp.png" %}

其实这样有些类似于科技书籍的排版，也是会采用小圆点句号，句子之间的间隙比较小。例如下图《电动力学》一书的排版。

{% include image.html title="Electrodynamics example" img="punctuation-ed.jpg" %}

由于半角的圆圈句号和顿号也是有的，所以中文标点里，除了书名号没法控制，只能用全宽的，还有引号可能会显示成全宽的(可以用直的引号`"`代替)，其他的都可以用半宽的标点加空格来更加精确的控制间距。这样可以在多个标点连续出现的情况下手动的进行标点挤压操作。

### 换行问题

(这一节其实和标点关系不大，但既然写了，就放在这儿吧:)

还有一个问题就是换行的问题。文本编辑器一般会用等宽字体，英文字母标点空格固定的是中文字母标点的二分之一宽，看起来很整齐。好多文本编辑器都是在会在空格处换行，而中文一段话加标点都没有空格，就不会换行，而一旦中间出现了一个里面有空格的英文短语(like this)，就在英文短语的中间换行了，看上去就很傻。

下图是Vim里显示的例子，当然这只是软件本身对中文支持不太好的问题。

{% include image.html title="Vim example" img="punctuation-gvim.png" %}

Web中也有换行的问题，英文的换行可以由`word-wrap`，`word-break`，`overflow-wrap`，`white-space`，`hypens`等相关的CSS属性来控制，可以在空格处换行，也可以在单词中间换行。但这些属性对CJK不起太大作用，中文没有单词的概念，除了遵守句号等标点不在一行的开始等规则，中文会在任意字的位置换行。所以遇到文章标题太长，可能会换行的情况，就无法达到好的效果，把一个词给分开。如下图三个标题中最上面的效果。

{% include image.html title="Line wrap example" img="punctuation-line-wrap.png" %}

我们可以使用特殊手段把中文的一个词组变为整体，例如给词组套上`<span>`然后设置`no-wrap`或者`inline-block`样式；或者在词组的字之间加入`WORD JOINER`(Unicode码位`U+2060`，HTML字符`&#8288;`)阻止其换行。把“浏览器”这个词变为一个整体后，效果就是上图中间的那样。

最后一种办法就是手动加入换行了，这样可以达到你想要的最精确的排版效果，如上图中下面所示。但是你必须要提前知道页面的宽度。PPT里面的标题可以这么调整，Web响应式布局就很难这么办了。

### 输入法

中文输入依赖于输入法。而在输入法中，中文模式下一般会自动输入中文标点。
除了常见的英文标点对应中文标点的映射，还有比较特殊的如用用`\`输入顿号`、`，`^`输入省略号`……`，用`_`输入破折号`——`，用`` ` ``输入`·`等。

输入法中不好输入的标点，就不会有太多人用，如直角引号。不过有的输入法会用`]`来映射直角引号`「」`。

当然一般输入法也可以设置标点使用全角模式还是半角模式。这样就可以在输入中文的时候依然用英文标点了。

## 结尾

排版问题和现实世界中的其他问题一样，没有完美的方案，只有各种取舍。而且不同的人也有不同的审美。但我觉得很重要的一点就是一致性，你需要有自己的一套规则，而不是乱用。

此外，Web上的中文文字排印是个挺有趣的领域，我想以后有机会可以在这一方面做一些好玩的东西来。
