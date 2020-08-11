---
layout: post
title:  矩阵乘的CPU实现 - Tensorflow
author: enh6
categories: blog
---

上篇文章简要介绍了Eigen的矩阵乘，这篇我们来看Tensorflow是怎么进行矩阵乘计算的。

Tensorflow使用了Eigen Tensor库，MatMul op的计算会调用Eigen Tensor的`contraction`操作来进行GEMM计算。但TensorFlow加入了自己的实现，偏特化了`float`类型的`TensorContractionKernel`。把分块，打包和GEBP替换为了使用MKL-DNN库(后来改名叫DNNL，后来又改名叫[oneDNN](https://github.com/oneapi-src/oneDNN)了)的实现。具体实现在`eigen_contraction_kernel.h`文件。Tensorflow可以选择用Eigen的实现，但默认是用MKL-DNN的。

### 分块

分块在调用Eigen的`evaluateProductBlockingSizesHeuristic`函数得到`MC KC NC`后，又做了进一步的调整，以适合MKL-DNN。

MKL-DNN的GEMM计算也会看块的MC NC是否是循环展开系数的整数倍，这应该就是MKL-DNN内部的MR和NR。所以MC NC会进行调整，使其为MR NR的倍数。另外KC这里又要进行尽量均匀的分块了。

### 打包

MKL-DNN有标准的BLAS接口，所以可以直接pack成按列存储的块。在一些情况下，还可以不进行pack，直接进行计算，省去这一步的耗时。

### GEBP

直接调用MKL-DNN的`mkldnn_sgemm`(后来改名叫`dnnl_sgemm`)函数进行GEBP计算。

### Tensorflow MKL版

上面的矩阵乘用的还是Eigen的Tensor计算，Eigen的threadpool，Eigen的GEMM逻辑，只在单个块的GEBP上调用单线程的MKL-DNN。而Tensorflow还可以在编译时加上mkl选项，生成Tensorflow MKL版本。MKL版本用MKL-DNN实现了很多op，在模型图优化的时候加入了一个`MklLayoutRewritePass`，把模型中的`MatmulOp`转换为`_MklMatmulOp`，这个op直接使用MKL-DNN的GEMM接口完成全部计算，完全使用MKL-DNN自己的线程管理和分块机制。

### 总结

本文介绍了Tensorflow中矩阵乘计算的CPU实现，接下来可能会再看一看MKL-DNN的实现是怎么样的。
