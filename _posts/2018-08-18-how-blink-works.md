---
layout: post
title: Blink是如何工作的
author: enh6
categories: blog
---

*[本文为Chrome团队的haraken@(Kentaro Hara)写的一篇blink的介绍文档的翻译。原始文档在[Google Docs](https://docs.google.com/document/d/1aitSOucL0VHZa9Z2vbRJSyAIsAz24kX8LFByQ5xQnUg/edit#)上。]*

*[目前这个文档还在完善中，许多参考链接里文档也还没有写。]*

为Blink项目工作并不容易。对于新的Blink开发者来说不容易，因为Blink引入了许多特有的概念和编码规则以实现高效的渲染。对于经验丰富的Blink开发者来说也不容易，因为Blink非常庞大，对性能、内存和安全性极为敏感。

本文档旨在提供一个“Blink是如何工作的”概述，希望能帮助Blink开发者快速熟悉架构：

-  本文档不是一个Blink详细架构和编码规则的全面教程。相反，本文档简明地描述了Blink的基本面，这些基本面在短期内不太可能发生变化，并提供了一些资源链接，如果您想了解更多信息，可以进一步阅读。

- 本文档不介绍特定功能(如ServiceWorkers，编辑)。相反，该文档介绍了在代码库中的许多地方都用到的基础功能(如内存管理，V8 API)。

有关Blink开发的更多信息，请参阅[Chromium wiki](https://www.chromium.org/blink)。

## Blink是做什么的

Blink是一个Web渲染引擎。粗略地说，Blink实现了一个浏览器标签页里显示的所有内容：

- 实现Web标准(如[HTML标准](https://html.spec.whatwg.org/multipage/?))，包括DOM，CSS和Web IDL
- 嵌入V8运行JavaScript
- 从底层网络栈请求资源
- 构建DOM树
- 计算样式和布局
- 嵌入[Chrome Compositor](https://chromium.googlesource.com/chromium/src/+/HEAD/cc/README.md)绘制图形

Blink通过[content public API](https://cs.chromium.org/chromium/src/content/public/)集成到Chromium，Android WebView和Opera等用户中。

{% include image.html img="blink-1.png" %}

从代码库的角度来看，Blink通常指的是`//third_party/blink/`。从项目角度来看，Blink通常是指实现Web平台功能的项目。实现Web平台功能的代码在`//third_party/ blink/`，`//content/renderer/`，`//content/browser/`等地方。

## 进程/线程架构

### 进程

Chromium是[多进程架构](https://www.chromium.org/developers/design-documents/multi-process-architecture)。Chromium有一个browser进程和N个在沙盒中的renderer进程。 Blink在renderer进程中运行。

有多少个renderer进程会被创建？出于安全原因，隔离跨站点iframe之间的内存地址非常重要(这称为[Site Isolation](https://www.chromium.org/Home/chromium-security/site-isolation))。理论上，应该为每个站点创建一个renderer进程。 然而实际上，当用户打开太多标签页或设备没有足够内存时，为每个站点创建一个renderer进程会消耗太多资源。这时一个renderer进程可能被从不同站点加载的多个iframe或标签页共享。这意味着同一个标签页中的iframe可能由不同的renderer进程托管，不同标签页中的iframe也可能由同一renderer进程托管。renderer进程，iframe和标签页之间没有1对1映射关系。

鉴于renderer进程在沙箱中运行，Blink需要请求browser进程进行系统调用(如文件访问，播放音频)和访问用户数据(如cookie，密码)。这个browser进程和renderer进程间的通信由[Mojo](https://chromium.googlesource.com/chromium/src/+/master/mojo/README.md)实现。(注：过去我们使用的是[Chromium IPC](https://www.chromium.org/developers/design-documents/inter-process-communication)， 有些地方仍在使用它。但是它已经被弃用，并且在底层使用Mojo。) 在Chromium方面，正在进行的 [Servicification](https://www.chromium.org/servicification)工作正在将browser进程抽象为一组service。从Blink的角度来看，Blink可以使用Mojo与这些service和browser进程进行交互。

{% include image.html img="blink-2.png" %}

更多信息：

- [多进程架构](https://www.chromium.org/developers/design-documents/multi-process-architecture) 
- Blink中的Mojo编程: platform/mojo/MojoProgrammingInBlink.md

### 线程

renderer进程中创建了多少个线程？

Blink有一个主线程，N个worker线程和几个内部线程。

几乎所有重要的事情都发生在主线程。所有JavaScript(worker除外)，DOM，CSS，样式和布局计算都在主线程上运行。Blink经过高度优化，可以最大限度地提高主线程的性能，主要是基于单线程架构。

Blink可能会创建多个worker线程来运行[Web Workers](https://html.spec.whatwg.org/multipage/workers.html#workers)，[ServiceWorker](https://w3c.github.io/ServiceWorker/)和[Worklet](https://www.w3.org/TR/worklets-1/)。

Blink和V8可能会创建一些内部线程来处理WebAudio，数据库，GC等等等。

对于跨线程通信，必须使用PostTask API进行消息传递。除了几个出于性能原因需要使用的地方，不鼓励使用共享内存。这就是为什么Blink代码库中看不到很多MutexLocks的原因。

{% include image.html img="blink-3.png" %}

更多信息：

- Blink中的线程编程： platform/wtf/ThreadProgrammingInBlink.md
- workers: [core/workers/README.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/core/workers/README.md)

### Blink的初始化和终止化(finalization)

Blink由[BlinkInitializer::Initialize()](https://cs.chromium.org/chromium/src/third_party/blink/renderer/controller/blink_initializer.cc?sq=package:chromium&dr=C&g=0&l=86)初始化。必须在执行任何Blink代码之前调用BlinkInitializer::Initialize()。

另一方面，Blink永远不会终止，也就是说，renderer进程会不进行清理强制结束。一个原因是性能考虑。另一个原因是，通常很难以优雅的顺序清理renderer进程中的所有内容(不值得在这里投入精力)。

## 目录结构

### Content public API和Blink public API

[Content Public API](https://cs.chromium.org/chromium/src/content/public/)是让embedder嵌入渲染引擎的API层。Content public API必须仔细维护，因为它们会暴露给embedder使用。

[Blink public API](https://cs.chromium.org/chromium/src/third_party/blink/public/?q=blink/public&sq=package:chromium&dr)是向Chromium暴露`//third_party/blink/`的功能的一层API。这一层API只是从WebKit继承而来的历史包袱。在WebKit时代，Chromium和Safari共享了WebKit的实现，因此需要一层API将Webkit的功能暴露给Chromium和Safari。现在Chromium是`//third_party/blink/`的唯一embedder了，这一层API就没有意义了。我们正在将web平台代码从Chromium移动到Blink，以减少Blink public API的数量(这个项目叫做[Onion Soup](https://docs.google.com/document/d/1K1nO8G9dO9kNSmtVz2gJ2GG9gQOTgm65sJlV3Fga4jE/edit#))。

{% include image.html img="blink-4.png" %}

### 目录结构和依赖关系

`//third_party/blink/`具有以下目录。这些目录的更详细定义，请参阅[此文档](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/README.md)。

- `platform/`

  Blink底层功能的集合，从`core/`中重构而来。如几何和图形工具库。

- `core/`和`modules/`

  Web标准中定义的所有Web平台功能的实现。`core/`中实现了与DOM紧密结合的功能。`modules/`实现了更多独立的功能，如WebAudio，IndexedDB。

- `bindings/core/`和`bindings/modules/`

  理论上`bindings/core/`是`core/`的一部分，`bindings/modules/`是`modules/`的一部分。大量使用V8 API的文件会放在`bingings`中。

- `controller/`

  一组使用`core/`和`modules/`的高层库。如devtools的前端。

依赖关系按以下顺序：

- Chromium => controller / => modules/和bindings/modules/ => core/和bindings/core/ => platform/ => 底层元素(primitive)，如//base，//v8和//cc

Blink小心地维护了暴露于`//third_party/blink/`的底层元素的列表。

更多信息：

- 目录结构和依赖关系：[blink/renderer/README.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/README.md)

### WTF

WTF是一个“Blink特有的基础库”，位于`platform/wtf/`。我们试图尽可能地在Chromium和Blink之间统一编码元素(primitive)，因此WTF应该很小。 WTF是必需的，因为有许多类型，容器和宏需要针对Blink的工作负载和Oilpan(Blink GC)进行优化。如果在WTF中定义了类型，则Blink必须使用WTF类型而不是// base或std库中定义的类型。最常用的是vector，hashset，hashmap和string。 Blink应该使用`WTF::Vector`，`WTF::HashSet`，`WTF::HashMap`，`WTF::String`和`WTF::AtomicString`而不是`std::vector`，`std::*set`，`std::*map`和`std::string`。

更多信息：

- 如何使用WTF：[platform/wtf/README.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/wtf/README.md)

## 内存管理

就Blink而言，你需要关心三个内存分配器：

- PartitionAlloc
- Oilpan(也就是Blink GC)
- malloc(不推荐)

你可以使用`USING_FAST_MALLOC()`在PartitionAlloc的heap上分配一个对象：

```C++
class SomeObject {
  USING_FAST_MALLOC(SomeObject);
  static std :: unique_ptr<SomeObject> Create(){
    return std :: make_unique<SomeObject>(); //在PartitionAlloc的堆上分配。
  }
};
```

PartitionAlloc分配的对象的生命周期应由`scoped_refptr<>`或`std::unique_ptr<>`管理。强烈不建议手动管理生命周期。Blink中禁止手动`delete`。

你可以使用`GarbageCollected`在Oilpan的堆上分配一个对象：

```
class SomeObject：public GarbageCollected<SomeObject> {
  static SomeObject* Create(){
    return new SomeObject; //在Oilpan的堆上分配。
  }
};
```

Oilpan分配的对象的生命周期由垃圾回收自动管理。你必须使用特殊的指针(如`Member<>`和`Persistent<>`)来保存Oilpan堆上的对象。请参阅[这个API参考](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/heap/BlinkGCAPIReference.md)以熟悉有关Oilpan的编程限制。最重要的限制是不允许在Oilpan的对象的析构函数中操作任何其他Oilpan的对象(因为无法保证销毁顺序)。

如果既不使用`USING_FAST_MALLOC()`也不使用`GarbageCollected`，则会在系统malloc的堆上分配对象。Blink强烈建议不要这样做。所有Blink对象应由PartitionAlloc或Oilpan分配：

- 默认情况下使用Oilpan。
- 仅当 1) 对象的生命周期非常清楚并且`std::unique_ptr<>`足够用，2) 在Oilpan上分配对象引入了很多复杂性或者 3) 在Oilpan上分配对象给垃圾收集运行时增加了许多不必要的压力时，才使用PartitionAlloc。

无论你是使用PartitionAlloc还是Oilpan，你都必须非常小心，不要创建悬空指针(注：强烈建议不要使用原始指针)或造成内存泄漏。

更多信息：

- 如何使用PartitionAlloc：[platform/wtf/allocator/Allocator.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/wtf/allocator/Allocator.md)
- 如何使用Oilpan：[platform/heap/BlinkGCAPIReference.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/heap/BlinkGCAPIReference.md)
- Oilpan GC的设计：[platform/heap/BlinkGCDesign.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/heap/BlinkGCDesign.md)

## 任务调度

为了提高渲染引擎的响应能力，blink的task应该尽量的异步执行。任何同步的IPC/Mojo/可能需要几毫秒的操作都需要避免(尽管有些操作是不可避免的，如用户的JavaScript执行)。

renderer进程中的所有task都应该设置适当的类型post到[Blink Scheduler](https://chromium.googlesource.com/chromium/src/+/lkcr/third_party/WebKit/Source/platform/scheduler/README.md)，如下所示：

```
//将task post到一帧的scheduler，类型为kNetworking
frame->GetTaskRunner(TaskType::kNetworking)->PostTask(..., WTF::Bind(&Function));
```

Blink Scheduler维护多个任务队列并巧妙地确定任务的优先级，以最大化用户感知的性能。指定[正确的任务类型](https://cs.chromium.org/chromium/src/third_party/blink/public/platform/task_type.h?q=blink+tasktype&sq=package:chromium&dr=CSs&l=5)非常重要，能使Blink Scheduler正确且巧妙地安排任务。

更多信息：

- 如何发布任务：platform/scheduler/PostTask.md

## Page，Frame，Docuemnt，DOMWindow等

### 概念

Page，Frame，Document，ExecutionContext和DOMWindow是以下概念：

- Page对应于标签页(OOPIF没有打开的情况。下面会解释OOPIF)。每个renderer进程可能包含多个标签页。
- Frame对应于main frame或iframe。每个Page可能包含多个树形层次结构排列的Frame。
- DOMWindow对应于JavaScript中的`window`对象。每个Frame都有一个DOMWindow。
- Document对应于JavaScript中`window.document`对象。每个Frame都有一个Document。
- ExecutionContext是一个用来抽象Document(用于主线程)和WorkerGlobalScope(用于worker线程)的概念。

renderer进程:Page = 1:N

Page:Frame = 1:M

在任何时间点，Frame:DOMWindow:Document(或ExecutionContext) = 1:1:1，但映射可能会随时间而变化。如以下代码：

```
iframe.contentWindow.location.href="https://example.com";
```

在这种情况下，将为https://example.com创建一个新的Window和一个新的Document。然而Frame可能被重复使用。

(注：确切地说，在某些情况下会创建一个新Document，但Window和Frame会被重用。还有[更复杂的情况](https://docs.google.com/presentation/d/1pHjF3TNCX--j0ss3SK09pXlVOFK0Cdq6HkMcOzcov1o/edit#slide=id.g4983c55b2d55fcc7_42)。)

更多信息：

- core/frame/FrameLifecycle.md

### OOPIF(out of process iframe)

[网站隔离(Site Isolation)](https://www.chromium.org/developers/design-documents/site-isolation)使blink更安全，但也更复杂:)。网站隔离的想法是为每个网站创建一个renderer进程。(这里网站是网页的注册域名+1级子域名及其URL scheme。例如，https://mail.example.com和https://chat.example.com位于同一网站，但https://noodles.com和https://pumpkins.com不是。)如果一个页面包含一个跨站点iframe，那么该页面可能由两个renderer进程托管。考虑以下页面：

```
<!-- https://example.com -->
<body>
<iframe src="https://example2.com"></iframe>
</body>
```

main frame和iframe可能由不同的renderer进程托管。在这个renderer进程的frame由LocalFrame表示，而不在这个renderer进程的frame由RemoteFrame表示。

从main frame的角度来看，main frame是LocalFrame，iframe是RemoteFrame。从iframe的角度来看，main frame是RemoteFrame，iframe是LocalFrame。

LocalFrame和RemoteFrame(可能存在于不同的renderer进程中)之间的通信通过browser进程处理。

更多信息：

- 设计文档：[网站隔离设计文档](https://www.chromium.org/developers/design-documents/site-isolation)
- 网站隔离下如何编写代码：core/frame/SiteIsolation.md

### Detached Frame/Document

Frame/Document可能处于分离状态。考虑以下情况：

```
doc = iframe.contentDocument;
iframe.remove(); // iframe与DOM树分离。
doc.createElement("div"); //但你仍然可以在分离的Frame上运行脚本。
```

棘手的事实是你仍然可以在分离的Frame上运行脚本或执行DOM操作。由于Frame已经分离，大多数DOM操作都会失败并抛出错误。不幸的是，分离的Frame上的行为在浏览器之间并不一致，也没有在标准中明确定义。基本上JavaScript应该继续运行，但是大多数DOM操作都应该失败，除了一些适当的例外，例如：

```
void someDOMOperation(...) {
  if（!script_state_->ontextIsValid()) { // Frame已经分离
    ...; // 设置异常等
    return;
  }
}
```

这意味着，在通常情况下Blink需要在frame被分离时做一些清理操作。你可以通过继承`ContextLifecycleObserver`来做到这一点：

```
class SomeObject : public GarbageCollected<SomeObject>, public ContextLifecycleObserver {
  void ContextDestroyed() override {
    //在这里执行清理操作。
  }
  ~SomeObject() {
    //在这里进行清理操作并不是一个好主意，因为这样做已经太晚了。另外，析构函数不允许触及Oilpan堆上的任何其他对象。
  }
};
```

## Web IDL binding

当JavaScript访问`node.firstChild`时，node.h中的`Node::firstChild()`会被调用。这是如何工作的？我们来看看`node.firstChild`是如何工作的。

首先，您需要根据标准定义一个IDL文件

```
// node.idl
interface: EventTarget {
  [...] readonly attribute Node? firstChild;
};
```

Web IDL的语法在[Web IDL标准](https://heycam.github.io/webidl/)中定义。`[...]`叫做IDL扩展属性。一些IDL扩展属性在Web IDL标准中定义，其他的是[Blink特有的IDL扩展属性](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/bindings/IDLExtendedAttributes.md)。除了Blink特有的IDL扩展属性，IDL文件应以遵守标准的方式编写(也就是只需从标准中复制和粘贴)。

其次，你需要为Node定义一个C++类并为firstChild实现一个C++的getter：

```
class EventTarget : public ScriptWrappable { //所有暴露给JavaScript的类都必须从ScriptWrappable继承。
  ...;
};

class Node : public EventTarget {
  DEFINE_WRAPPERTYPEINFO(); //所有具有IDL文件的类都必须具有此宏。
  Node* firstChild() const {return first_child_; }
};
```

在一般情况下，这就够了。构建node.idl时，[IDL编译器](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/bindings/IDLCompiler.md)会自动为Node接口和Node.firstChild生成Blink-V8绑定。自动生成的绑定在`//src/out/{Debug,Release}/gen/third_party/blink/renderer/bindings/core/v8/v8_node.h`。当JavaScript调用`node.firstChild`时，V8调用`v8_node.h`中的`V8Node::firstChildAttributeGetterCallback()`，然后它调用上面定义的`Node::firstChild()`。

更多信息：

- 如何添加Web IDL binding：[bindings/IDLCompiler.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/bindings/IDLCompiler.md)
- 如何使用IDL扩展属性：[bindings/IDLExtendedAttributes.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/bindings/IDLExtendedAttributes.md)
- 标准：[Web IDL标准](https://heycam.github.io/webidl/)

## V8和Blink

### Isolate，Context，World

当你编写V8 API有关的代码时，了解Isolate，Context和World的概念非常重要。它们分别由代码库中的`v8::Isolate`，`v8::Context`和`DOMWrapperWorld`表示。

Isolate对应于一个物理线程。Isolate:Blink中的物理线程 =  1:1。主线程有自己的Isolate。worker线程有自己的Isolate。

Context对应于全局对象(对Frame来说，它是Frame的window对象)。由于每个Frame都有自己的window对象，因此renderer进程中有多个Context。当调用V8 API时，必须确保处于正确的Context中。否则，`v8::Isolate::GetCurrentContext()`将返回错误的上下文，在最坏的情况下，它会泄漏对象并导致安全问题。

World概念是为了支持Chrome扩展程序内容脚本。World不与Web标准中的任何内容对应。内容脚本希望与网页共享DOM，但出于安全原因，内容脚本的JavaScript对象必须与网页的JavaScript堆隔离。 (一个内容脚本的JavaScript堆也必须与另一个内容脚本的JavaScript堆隔离。)为了实现隔离，主线程为网页创建一个main world，为每个内容脚本创建一个隔离的world。main world和隔离的world可以访问相同的C++ DOM对象，但它们的JavaScript对象是隔离的。通过为一个C++DOM对象创建多个V8 wrapper来实现这种隔离。即每个World一个V8 wrapper。

{% include image.html img="blink-5.png" %}

Context，World和Frame之间有什么关系？

想象一下主线程上有N个World(一个main world + (N - 1)个隔离的world)。然后一个Frame应该有N个window对象，每个对象用于一个world。Context是对应于window对象的概念。这意味着当我们有M个Frame和N个World时，我们有M * N个Context(但是Context延迟创建的)。

对于worker，只有一个World和一个全局对象。因此，只有一个Context。

同样，当使用V8 API时，应该非常小心使用正确的Context。否则，你最终会在隔离的World之间泄漏JavaScript对象并导致安全灾难(如A.com的扩展可以操纵B.com的扩展)。

更多信息：

- [bindings/core/v8/V8BindingDesign.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/bindings/core/v8/V8BindingDesign.md)

### V8 API

[//v8/include/v8.h](https://cs.chromium.org/chromium/src/v8/include/v8.h?q=v8.h&sq=package:chromium&dr=CSs&l=10)中定义了很多V8 API。由于V8 API很低层并且难以正确使用，[platform/bindings/](https://cs.chromium.org/chromium/src/third_party/blink/renderer/platform/bindings/?q=platform/bindings&sq=package:chromium&dr)提供了一些包了V8 API的辅助类。你应该考虑尽可能多地使用辅助类。如果你的代码必须大量使用V8 API，那么这些文件应该放在bindings/{core,modules}中。

V8使用句柄指向V8对象。最常见的句柄是`v8::Local<>`，用于指向机器堆栈中的V8对象。必须在机器堆栈上分配`v8::HandleScope`后才能使用`v8::Local<>`。不应在机器堆栈外使用`v8::Local<>`：

```
void function() {
  v8::HandleScope scope;
  v8::Local<v8::Object> object = ...;  // 这是对的
}

class SomeObject : public GarbageCollected<SomeObject> {
  v8::Local<v8::Object> object_;  // 这是错的
};
```

如果要从机器堆栈外部指向V8对象，则需要使用[wrapper tracing](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/bindings/TraceWrapperReference.md)。但是，你必须非常小心，不要使用它创建引用循环。通常，V8 API很难使用。如果你不知道自己在做什么，请询问[blink-review-bindings@](https://groups.google.com/a/chromium.org/forum/#!forum/blink-reviews-bindings)。

更多信息：

- 如何使用V8 API和辅助类： platform/bindings/HowToUseV8FromBlink.md

### V8 wrapper

每个C++ DOM对象(如Node)都有相应的V8 wrapper。准确地说，每个World中的每个C++ DOM对象都有相应的V8 wrapper。

V8 wrapper对它们对应的C++ DOM对象有强引用。但是，C++ DOM对象对V8 wrapper只有弱引用。因此，如果您希望将V8 wrapper保持一段生存时间，则必须显式地执行这个操作。否则，V8 wrapper将被过早回收，V8 wrapper上的JS属性将丢失...

```
div = document.getElementbyId("div");
child = div.firstChild;
child.foo = "bar";
child = null;
gc();  //如果我们什么都不做，那么|firstChild|的V8 wrapper将被GC回收
assert(div.firstChild.foo === "bar");  //...这会失败
```

如果我们不做任何事情， child会被GC回收，因此child.foo丢失。为了使div.firstChild的V8 wrapper保持生存，我们必须添加一种机制，保证只要div所在的DOM树能被V8访问，div.firstChild的V8 wrapper就能保持生存。

有两种方法可以保持V8 wrapper存活： [ActiveScriptWrappable](https://cs.chromium.org/chromium/src/third_party/blink/renderer/bindings/core/v8/active_script_wrappable.h?q=activescriptwrappable&sq=package:chromium&dr=CSs&l=16)和[wrapper tracing](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/bindings/TraceWrapperReference.md)。

更多信息：

- 如何管理V8 wrapper的生存周期：bindings/core/v8/V8Wrapper.md
- 如何使用wrapper tracing：[platform/bindings/TraceWrapperReference.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/platform/bindings/TraceWrapperReference.md)

## 渲染管线

从Blink收到HTML文件，到像素显示在屏幕上，经过了很长的一段旅程。渲染管线的架构如下。

{% include image.html img="blink-6.png" %}

阅读[这个优秀的演示文档](https://docs.google.com/presentation/d/1boPxbgNrTU0ddsc144rcXayGA_WF53k96imRH8Mp34Y/edit#slide=id.p)，以了解渲染管道的每个阶段所作的工作。(我不认为我能写出比这更好的解释了:-)

更多信息：

- 概述： [像素的生命](https://docs.google.com/presentation/d/1boPxbgNrTU0ddsc144rcXayGA_WF53k96imRH8Mp34Y/edit#slide=id.p)
- DOM： [core/dom/README.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/core/dom/README.md)
- 样式：[core/css/README.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/core/css/README.md)
- 布局：[core/layout/README.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/core/layout/README.md)
- Paint：[core/paint/README.md](https://chromium.googlesource.com/chromium/src/+/master/third_party/blink/renderer/core/paint/README.md)
- Compositor线程： [Chromium图形渲染](https://www.chromium.org/developers/design-documents/chromium-graphics)

### 问题？
如果你有任何问题，请在blink-dev@chromium.org(一般性问题)或platform-architecture-dev@chromium.org (与架构相关的问题)上提问。我们很乐意提供帮助！:D



