---
layout: post
title:  奇技淫巧 - 替换Tensorflow内置kernel
author: enh6
categories: blog
---

Tensorflow可以进行扩展，[自定义Op和Kernel](https://www.tensorflow.org/guide/create_op)。我们可以通过动态链接库，将这些op和kernel直接加载到官方的包中，方便的对Tensorflow进行扩展。

但是Tensorflow内置的op和kernel可以这样玩么？改掉内置的op并没有什么意义：这等于破坏API。但是改掉内置的kernel实现还是有意义的。例如我们在某个后端上有一个更好的矩阵乘kernel，如果能不重新编译Tensorflow，动态的替换掉Tensorflow默认的矩阵乘的实现，岂不美哉？下面基于Tensorflow1.14来讲讲怎么做。

假设我们自己的矩阵乘kernel为 `MyMatMulOp`，编译为动态链接库，并注册kernel：
```cpp
REGISTER_KERNEL_BUILDER(Name("MatMul").Device(DEVICE_CPU), MyMatMulOp);
```
然后`tf.load_op_library`，会在执行的时候报错：
```
tensorflow.python.framework.errors_impl.InvalidArgumentError: Multiple OpKernel registrations match NodeDef 'node MatMul (defined at test.py:20) ': 'op: "MatMul" device_type: "CPU" constraint { name: "T" allowed_values { list { type: DT_FLOAT } } }' and 'op: "MatMul" device_type: "CPU" constraint { name: "T" allowed_values { list { type: DT_FLOAT } } }'
```
说明注册成功了，但和内置的kernel有冲突，Tensorflow不知道选择用哪一个。所以说Tensorflow并不支持替换内置kernel。

那是不是没办法了呢？其实还是有办法的：我们动态加载的代码，可以拿framework里的函数来用，改Tensorflow内部的结构。op kernel的相关代码在`op_kernel.cc`文件中，可以看到，注册信息就在放一个全局变量中，并且通过函数`GlobalKernelRegistry()`访问：

```cpp
struct KernelRegistry {
  mutex mu;
  std::unordered_multimap<string, KernelRegistration> registry GUARDED_BY(mu);
};
void* GlobalKernelRegistry();
```

这就好办了，把GlobalKernelRegistry中内置的kernel信息删掉就好了。函数没有在头文件中暴露？没关系，把用到的函数和数据类型自己声明一下，就可以在自己的代码中调用了。

我们还可以把删除kernel的操作也包装成一个Op：
```cpp
REGISTER_OP("RemoveKernel")
  .Input("in: string")
  .Output("out: string");

class RemoveKernelOp : public OpKernel {
public:
  explicit RemoveKernelOp(OpKernelConstruction* context) : OpKernel(context) {}

  void Compute(OpKernelContext* context) override {
    auto global_registry = reinterpret_cast<KernelRegistry*>(GlobalKernelRegistry());
    tf_shared_lock lock(global_registry->mu);

    const Tensor& input = context->input(0);
    Tensor* output = NULL;
    OP_REQUIRES_OK(context, context->allocate_output(0, input.shape(), &output));

    auto src = input.flat<string>();
    auto dst = output->flat<string>();
    for (int i = 0; i < src.size(); i++) {
      string key = src(i) + ":CPU:";
      auto regs = global_registry->registry.equal_range(key);
      global_registry->registry.erase(regs.first, regs.second);
      for (auto iter = regs.first; iter != regs.second; ++iter) {
        auto kernel_def = iter->second.def;
        LOG(INFO) << "Remove kernel:   " << kernel_def.ShortDebugString();
      }
      dst(i) = "ok";
    }
  }
};

REGISTER_KERNEL_BUILDER(Name("RemoveKernel").Device(DEVICE_CPU), RemoveKernelOp);
```

然后就可以先删除内置kernel，再载入自己的kernel，达到替换的效果了：

```python
mod = tf.load_op_library('./mod.so')

with tf.Session() as sess:
    ret = mod.remove_kernel(["MatMul"]).eval()

tf.load_op_library('./my_matmul.so')
```

这里的示例代码删除的是CPU后端的所有的kernel，但更精细的操作想必也是可以做到的。
