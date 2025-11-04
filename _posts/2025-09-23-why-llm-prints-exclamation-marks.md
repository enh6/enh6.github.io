---
layout: post
title: 为什么大模型有时候出bug会输出"!!!!!!!!!!!"？
author: enh6
categories: blog
---

**不是因为震惊了，而是bug导致计算结果出现了NaN。**

大模型都是浮点运算，一旦中间的任何一个计算结果出现了一个`NaN`，`NaN`就会一传十、十传百，把结果全变成`NaN`。sampler选概率最大的token，但next token的概率分布也全是`NaN`，于是`argmax`就选到了词表中的第一个词，而第一个词经常就是这个感叹号`!`。

**那么问题又来了，为什么分词器词表的第一个词是`!`呢？**

大模型常用BPE分词算法，我们用一个包含所有8比特的utf-8字节的表作为初始词表，值为0-255，共256个不同的值，用这个词表就可以表示所有Unicode文本了。这256个不同的值如果每个都映射一个字符，就能送到BPE算法进行分词了。

而这个映射关系，很多都是借鉴GPT2而来的，代码如下：
```python
# source: https://github.com/openai/gpt-2/blob/master/src/encoder.py
def bytes_to_unicode():
    """
    Returns list of utf-8 byte and a corresponding list of unicode strings.
    The reversible bpe codes work on unicode strings.
    This means you need a large # of unicode characters in your vocab if you want to avoid UNKs.
    When you're at something like a 10B token dataset you end up needing around 5K for decent coverage.
    This is a signficant percentage of your normal, say, 32K bpe vocab.
    To avoid that, we want lookup tables between utf-8 bytes and unicode strings.
    And avoids mapping to whitespace/control characters the bpe code barfs on.
    """
    bs = list(range(ord("!"), ord("~")+1))+list(range(ord("¡"), ord("¬")+1))+list(range(ord("®"), ord("ÿ")+1))
    cs = bs[:]
    n = 0
    for b in range(2**8):
        if b not in bs:
            bs.append(b)
            cs.append(2**8+n)
            n += 1
    cs = [chr(n) for n in cs]
    return dict(zip(bs, cs))
```

这个函数的功能是：0-255这256个值，如果看作Unicode码位，是一个可打印字符，也就是上面的函数第一行的字符，就用这个字符表示。如果看作Unicode码位，是控制符，空格等，不兼容bpe代码，就用Unicode码位256以及之后的字符来表示。最终的效果是挑了Unicode码位的前256个可打印字符，组成字符串，来表示uft-8的字节流，进行分词。

Unicode编码表中第一个可打印的符号是`!`，上面函数得到的词表的第一个项是`33: '!'`，最后经过BPE算法扩充到一个大词表，但前面这些词的位置是已经确定的。

**那么问题又来了，为什么Unicode编码中第一个可打印的符号是`!`呢？**

Unicode最前面的字符编码是兼容ASCII编码的，ASCII编码中第一个可打印的符号是`!`，所以Unicode编码中第一个可打印的符号是`!`。

**那么问题又来了，为什么ASCII编码中第一个可打印的符号是`!`呢？**

ASCII编码的字符排列是参照当时机械打字机的键盘排布来的，而`!`就是在`1`加`Shift`这个按键位置，也沿用到我们至今在用的电脑键盘上。而`!`排在这里的原因是[`!`和`1`都是最后被加到打字机键盘的字符](https://en.wikipedia.org/wiki/Typewriter#Other_layouts_for_English:~:text=On%20modern%20keyboards%2C%20the%20exclamation%20point%20is%20the%20shifted%20character%20on%20the%201%20key%2C%20because%20these%20were%20the%20last%20characters%20to%20become%20%22standard%22%20on%20keyboards.)，直到1960年代左右才逐渐成为标配的。

**那么问题又来了，为什么打字机键盘几十年里都没有`!`和`1`这些字符呢？**

因为可以用小写`l`来代替`1`，[用`'`加`backspace`加`.`组合来合成`!`](https://en.wikipedia.org/wiki/Typewriter#Other_layouts_for_English:~:text=Similarly%2C%20the%20exclamation%20point%20was%20created%20by%20combining%20an%20apostrophe%20and%20a%20period)。

**完。**
