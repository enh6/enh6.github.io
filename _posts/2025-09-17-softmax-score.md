---
layout: post
title: 专家路由softmax score的等价形式
author: enh6
categories: blog
---

记录一下MoE模型专家路由里的一个小疑惑。

MoE层路由里，专家的选择，输入为专家的打分，用topK选择专家，用softmax(也有用sigmoid的)归一化作为权重加权。

在transformer库中，Qwen3 MoE是这样写的：
```
routing_weights = F.softmax(router_logits, dim=1, dtype=torch.float)
routing_weights, selected_experts = torch.topk(routing_weights, self.top_k, dim=-1)
routing_weights /= routing_weights.sum(dim=-1, keepdim=True)
```
而gpt-oss是这样写的：
```
router_top_value, router_indices = torch.topk(router_logits, self.top_k, dim=-1)
router_top_value = torch.nn.functional.softmax(router_top_value, dim=1, dtype=router_top_value.dtype)
```
为什么不一样呢？

想了一下，这两者其实是等价的。

先softmax再取topK，再归一化一次，等效于先取topK，再应用softmax。Softmax只是做了一个x到exp(x)的变换，然后整体scale了一下。所以对所有值的变换和对topK值的变换是一样的，只是scale不同。而最后都归一化到和为1，就是scale也一样了。差别是第二种写法计算量更小。
