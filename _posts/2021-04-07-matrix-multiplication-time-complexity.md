---
layout: post
title:  矩阵乘的时间复杂度
author: enh6
categories: blog
---
曾经的我很naive，只知道naive的矩阵乘算法，以为矩阵乘就是O(n<sup>3</sup>)的复杂度。

直到我看到了[Quanta Magazine上的一篇文章](https://www.quantamagazine.org/mathematicians-inch-closer-to-matrix-multiplication-goal-20210323/)，才知道有时间复杂度小于O(n<sup>3</sup>)的矩阵乘算法，最新的算法理论上的复杂度已经是O(n<sup>2.3728596</sup>)了。

最新的算法属于理论研究层面，常数项超级大，在[宇宙级尺度](https://en.wikipedia.org/wiki/Galactic_algorithm)的计算上才能有效，并没有办法应用到现实大小的矩阵计算上，也不是我等能看得懂的。但有一个复杂度为O(n<sup>2.807</sup>)的[Strassen算法](https://en.wikipedia.org/wiki/Strassen_algorithm)是能实际应用的，而且我都能看懂原理。

Naive的算法中，一个`n×n`的矩阵乘以一个`n×n`的矩阵，可以分割为8个`n/2×n/2`的小矩阵乘法和4个小矩阵加法，而加法只是n<sup>2</sup>的复杂度，相对于乘法可以忽略不记，所以复杂度是随着n以log<sub>2</sub>(8)=3立方指数增长的。但Strassen算法可以神奇的用7个`n/2×n/2`的小矩阵乘法和18个小矩阵加法来计算，相当于用多了12个矩阵加法的代价节省了一个矩阵乘法，所以总的复杂度是以log<sub>2</sub>(7)≈2.87指数增长的。

其实这些信息在维基百科上的[矩阵乘词条](https://en.wikipedia.org/wiki/Matrix_multiplication_algorithm)上都写的明明白白。任何领域的学习研究，首先就要做的就是读一读相关的维基百科词条，真的是要面壁了🤦。
