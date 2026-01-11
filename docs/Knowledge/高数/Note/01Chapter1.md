---
lang: zh-CN
title: 高等数学
titleTemplate: 函数与极限
description: 函数与极限
head:
  - - meta
    - name: description
      content: 高等数学
  - - meta
    - name: keywords
      content: 高等数学 函数 极限
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: true
footer: true
---
# 1 函数与极限

## 1.1 映射与函数

### 1.1.1 映射的概念

**定义：设 *X*、*Y* 是两个非空集合，如果存在一个法则 $f$，使得对 *X* 中每个元素 $x$，按法则 $f$，在 *Y* 中在唯一确定的元素 $y$ 与之对应，则称 $f$ 为从 *X* 到 *Y* 的映射，记作 $f：X→Y$**

$y$ 称为 $x$（在映射 $f$ 下）的像，并记作 $f(x)$，即 $y=f(x)$。
$x$ 称为 $y$ 的原像。

集合 *X* 称为映射 $f$ 的定义域，记作 $D_f$，即 $D_f=X$；<br/>
*X* 中所有元素的作斫组成的集合称为映射 $f$ 的值域，记作 $R_f$ 或 $f(X)$，即 $R_f=f(X)=\{ f(x)|x\in X \}$。

> [!TIP]
> 构成一个映射必须具备以下三个要素：集合 *X*，即定义域 $D_f=X$；集合 *Y*，即值域的范围：$R_f \subset Y$；对应法则 $f$，使对每个 $x\in X$，有唯一确定的 $y=f(x)$ 与之对应。<br/>
> 对每个 $x\in X$，元素 $x$ 的像 $y$ 是唯一的；而对每一个 $y\in R_f$，元素 $y$ 的原像不一定是唯一的；映射 $f$ 的值域 $R_f$ 是 $Y$ 的一个子集，即 $R_f \subset Y$，不一定 $R_f = Y$。

```mermaid
---
title: 映射
---
flowchart LR
  subgraph X
    A["张三"]
    B["李四"]
    C["王五"]
  end

  subgraph Y
    D["鼠"]
    E["牛"]
    F["虎"]
    G["兔"]
    H["龙"]
    I["蛇"]
    J["马"]
    K["羊"]
    L["猴"]
    M["鸡"]
    N["狗"]
    O["猪"]
  end
  A --> I
  B --> E
  C --> K
  X ==生肖==> Y
```
> [!NOTE]
> 上图中两个集合之间的法则是生肖。

### 1.1.2 映射的分类

- 单射：*X* 中任意两个不同元素 $x_1\neq x_2$，它们的像 $f(x_1)\neq f(x_2)$，则称 $f$ 为 *X* 到 *Y* 的单射。
  ```mermaid
  ---
  title: 单射
  ---
  flowchart LR
    subgraph X
      A["张三"]
      B["李四"]
      C["王五"]
    end

    subgraph Y
      E["牛"]
      I["蛇"]
      J["马"]
      K["羊"]
    end
    A --> I
    B --> E
    C --> K
    X ==生肖==> Y
  ```
- 满射：若 $R_f = Y$，即 *Y* 中任一元素 $y$ 都是 *X* 中某元素的像， 则称 $f$ 为 *X* 到 *Y* 上的映射或满射。
  ```mermaid
  ---
  title: 映射
  ---
  flowchart LR
    subgraph X
      A["张三"]
      B["李四"]
      C["王五"]
    end

    subgraph Y
      E["牛"]
      I["蛇"]
    end
    A --> I
    B --> E
    C --> I
    X ==生肖==> Y
  ```
- 双射：若映射 $f$ 是单射且满射，则称 $f$ 为一一映射或双射。
  ```mermaid
  ---
  title: 映射
  ---
  flowchart LR
    subgraph X
      A["张三"]
      B["李四"]
      C["王五"]
    end

    subgraph Y
      E["牛"]
      I["蛇"]
      K["羊"]
    end
    A --> I
    B --> E
    C --> K
    X ==生肖==> Y
  ```

### 1.1.3 逆映射下复合映射

TODO

### 1.1.4 函数的概念

**定义：设数集 $D\subset R$，则称映射 $f:D\to R$ 为定义 $D$ 上的函数，通常简记为 $y=f(x),x\in D$。**

$x$ 称为自变量，$y$ 称为因变量，$D$ 称为定义域，记作 $D_f$，即 $D_f=D$。<br/>
函数定义中，对每个 $x\in D$，按对应法则 $f$，总有唯一确定的值 $y$ 与之对应，这个值称为函数 $f$ 在 $x$ 处的函数值，记作 $f(x)$，即 $y=f(x)$。<br/>
因变量 $y$ 与自变量 $x$ 之间的这种依赖关系，通常称为函数关系。<br/>
函数值 $f(x)$ 的全体斫构成的集合称为函数 $f$ 的值域，记作 $R_f$ 或 $f(D)$，即 $R_f=f(D)=\{ y|y=f(x),x\in D \}$。

### 1.1.5 函数的定义域

- 对有实际背景的函数，根据实际背景中变量的实际意义确定。
  例如，在自由落体运动中，设物体下落的时间为 $t$，下落的距离为 $s$，开始下落的时刻 $t=0$，落地的时刻 $t=T$，则 $s$ 与 $t$ 之间的函数关系是<br/>
  $s=\frac{1}{2}gt^2, t\in [0,T]$

  这个函数的定义域就是区间 $[0,T]$。

- 对抽象地用算式表达的函数，通常约定这种函数的定义是使得算式有意义的一切实数组成的集合，这种定义域称为函数的**自然定义域**。
  > [!NOTE]
  > 在这种约定之下，一般的算式表达的函数可用“$y=f(x)$”来表达，而不必再表出 $D_f$。

  例如，函数 $y=\sqrt{1-x^2}$ 的定义域是闭区间 $[-1,1]$，函数 $y=\frac{1}{\sqrt{1-x^2}}$ 的定义域是开区间 $(-1,1)$。


### 1.1.6 函数的表示法

- 表格法

  | $x$ | $y$ |
  | --- | --- |
  | 0   | 5   |
  | 1   | 2   |
  | 6   | 3   |
  | 7   | 7   |

- 图形法
  
  <img src="./images/1.1.6.svg" alt="图形法" style="zoom:100%;background-color:black;" />

- 解析法

  $y=|x|$

### 1.1.7 特殊函数

- 符号函数
  $y=\operatorname{sgn} x=\begin{cases}
  1, & x>0, \\
  0, & x=0, \\
  -1, & x<0
  \end{cases}$

- 取整函数
  $y=[x]$

  <img src="./images/1.1.7.svg" alt="图形法" style="zoom:100%;background-color:black;" />

  > [!NOTE]
  > 取不超过自变量的最大整数。

- 狄利克雷函数
  $y=D(x)=\begin{cases}
  1, & x\in\mathbb{Q}, \\
  0, & x\in\mathbb{R} \setminus \mathbb{Q}
  \end{cases}$

  > [!NOTE]
  > $\mathbb{Q}$ 表示有理数，$\mathbb{R}$ 表示实数，$\mathbb{R}\setminus\mathbb{Q}$ 表示无理数。

### 1.1.8 函数的特性

#### 1.1.8.1 函数的有界性

设函数 $f(x)$ 的定义域为 $D$，数集 $X\subset D$。

- 如果存在数$K_1$，使得 $f(x)\leq K_1$，对任一 $x\in X$都成立，则称函数 $f(x)$ 在 $X$ 上有**上界**，而 $k_1$ 称为函数 $f(x)$ 在 $X$ 上的一个上界。
  > [!TIP]
  > 任何大于 $K_1$ 的值都是函数 $f(x)$ 在 $X$ 上的上界，所以函数 $f(x)$ 的上界有无数个。

- 如果存在数$K_2$，使得 $K_2\geq f(x)$，对任一 $x\in X$都成立，则称函数 $f(x)$ 在 $X$ 上有**下界**，而 $k_2$ 称为函数 $f(x)$ 在 $X$ 上的一个下界。
  > [!TIP]
  > 任何小于 $K_2$ 的值都是函数 $f(x)$ 在 $X$ 上的下界，所以函数 $f(x)$ 的下界有无数个。

- 如果存在正数 $M$，使得 $|f(x)|\leq M$，对任一 $x\in X$都成立，则称函数 $f(x)$ 在 $X$ 上**有界**，如果这样的 $M$ 不存在，就称函数 $f(x)$ 在 $X$ 上**无界**。

> [!TIP]
> 函数 $f(x)$ 在 $X$ 上有界的充分必要条件是它在 $X$ 上既有上界，又有下界。

#### 1.1.8.2 函数的单调性

设函数 $f(x)$ 的定义域为 $D$，区间 $I\subset D$。

- 如果对于区间 $I$ 上任意两点 $x_1$ 及 $x_2$，当 $x_1<x_2$ 时，恒有 $f(x_1)<f(x_2)$，则称函数 $f(x)$ 在区间 $I$ 上单调递增。
  <img src="./images/1.1.8.2_1.svg" alt="单调递增" style="zoom:100%;background-color:black;" />

- 如果对于区间 $I$ 上任意两点 $x_1$ 及 $x_2$，当 $x_1<x_2$ 时，恒有 $f(x_1)>f(x_2)$，则称函数 $f(x)$ 在区间 $I$ 上单调递减。
  <img src="./images/1.1.8.2_2.svg" alt="单调递减" style="zoom:100%;background-color:black;" />

> [!TIP]
> 单调递增函数和单调递减函数统称为**单调函数**。

#### 1.1.8.3 函数的奇偶性

设函数 $f(x)$ 的定义域 $D$ 关于原点对称。

- 如果对于任一 $x\in D$，$f(-x)=f(x)$ 恒成立，则称函数 $f(x)$ 为**偶函数**。
  <img src="./images/1.1.8.3_2.svg" alt="偶函数" style="zoom:100%;background-color:black;" />

- 如果对于任一 $x\in D$，$f(-x)=-f(x)$ 恒成立，则称函数 $f(x)$ 为**奇函数**。
  <img src="./images/1.1.8.3_1.svg" alt="奇函数" style="zoom:100%;background-color:black;" />

#### 1.1.8.4 函数的周期性

设函数 $f(x)$ 的定义域为 $D$，如果存在一个正数 $l$，使得对于任一 $x\in D$ 有 $(x\pm l)\in D$，且 $f(x+l)=f(x)$恒成立，则称 $f(x)$ 为**周期函数**，$l$ 称为 $f(x)$ 的周期，通常我们说周期函数的周期是指**最小正周期**。
<img src="./images/1.1.8.4_1.svg" alt="周期函数" style="zoom:100%;background-color:black;" />

> [!NOTE]
> 狄利克雷函数是周期函数，任何正有理数 $r$ 都是它的周期。因为不存在最小的正有理数，所以不存在最小的正周期。

### 1.1.9 反函数与复合函数

- **反函数**

  设函数 $f:D\to f(D)$ 是单射，则它存在逆映射 $f^{-1}:f(D)\to D$，称此映射 $f^{-1}$ 为函数 $f$ 的反函数。<br/>

  按此定义，对每个 $y\in f(D)$，有唯一的 $x\in D$ 使得 $f(x)=y$，于是有 $f^{-1}(y)=x$。也就是说，反函数 $f^{-1}$ 的对应法则是免全由函数 $f$ 的对应法则所决定的。<br/>

  例如，$y=2x+1$ 是直接函数，它的反函数为 $x=\frac{y-1}{2}$，反函数的自变量为 $y$，因变量为 $x$（变量改变）。将反函数的自变量符号改为 $x$，因变量符号改为 $y$，则得到 $y=\frac{x-1}{2}$（方程改变）。

  <img src="./images/1.1.9_1.svg" alt="正反函数" style="zoom:100%;background-color:black;" />

  > [!NOTE]
  > 相对于反函数 $y=f^{-1}(x)$ 来说，原来的函数 $y=f(x)$ 称为**直接函数**。把直接函数 $y=f(x)$ 和它的反函数 $y=f^{-1}(x)$ 的图形画在同一坐标平面上，这两个图形关于直线 $y=x$ 是对称的

- **复合函数**

  设函数 $y=f(u)$ 的定义域为 $D_f$，函数 $u=g(x)$ 的定义域为 $D_g$，且其值域 $R_g\subset D_f$，则由下式确定的函数 $y=f[g(x)],x\in D_g$ 称为由函数 $u=g(x)$ 与函数 $y=f(u)$ 构成的**复合函数**，它的定义域为 $D_g$，变量 $u$ 称为中间变量。

  函数 $g$ 与函数 $f$ 构成的复合函数，按“先 $g$ 后 $f$”的次序复合的函数，通常记为 $f\circ g$，即 $f(\circ g)(x)=f[g(x)]$。

  > [!TIP]
  > $g$ 与 $f$ 能构成复合函数 $f\circ g$的条件是：函数 $g$ 的值域 $R_g$ 必须含在函数 $f$ 的定义域 $D_f$ 内，即 $R_g\subset D_f$，否则不能构成复合函数。

### 1.1.10 初等函数

#### 1.1.10.1 基本初等函数

- 幂函数：$y=x^\mu$（$\mu\in\mathbb{R}$ 是常数）
- 指数函数：$y=a^x$（$a>0$ 且 $a\neq 1$ ）
- 对数函数：$y=\log_a(x)$（$a>0$ 且 $a\neq 1$，特别当$a=e$ 时，记为 $y=\ln x$）
- 三角函数：$y=\sin x$，$y=\cos x$，$y=\tan x$ 等
- 反三角函数：$y=\arcsin x$，$y=\arccos x$，$y=\arctan x$ 等

#### 1.1.10.2 初等函数

由常数和基本初等经过有限次的四则运算和有限次的函数复合步骤所构成并可用一个式子表示的函数，称为**初等函数**。

例如：$y=\sqrt{1-x^2}$，$y=\sin^2x$，$y=\sqrt{\cot{\frac{x}{2}}}$

> [!IMPORTANT]
> 性质：初等函数在定义区间上连续

以 $e$ 为底的指数函数 $y=e^x$ 和 $y=e^{-x}$ 所产生的双曲函数以及它们的反函数——反双曲函数：
**双曲正弦** $\sinh x=\frac{e^x-e^{-x}}{2}$ <br/>
**双曲余弦** $\cosh x=\frac{e^x+e^{-x}}{2}$ <br/>
**双曲正切** $\tanh x=\frac{\sinh x}{\cosh x}=\frac{e^x-e^{-x}}{e^x+e^{-x}}$

> [!NOTE]
> 双曲正弦的定义域为 $(-\infty,\infty)$；它是奇函数，它的图形通过原点且关于原点对称。在区间 $(-\infty,\infty)$ 内它是单调递增的。当 $x$ 的绝对值很大时，它的图形在第一象限内接近于曲线 $y=\frac{1}{2}e^x$；在第三象限内接近于曲线 $y=-\frac{1}{2}e^{-x}$。

根据双曲函数的定义，可证下列四个公式：<br/>
$\sinh (x+y)=\sinh x\cosh y+\cosh x\sinh y$
$\sinh (x-y)=\sinh x\cosh y-\cosh x\sinh y$
$\cosh (x+y)=\cosh x\cosh y+\sinh x\sinh y$
$\cosh (x-y)=\cosh x\cosh y-\sinh x\sinh y$

$\operatorname{arsinh}(x) = \ln\left(x + \sqrt{x^2 + 1}\right)$

**反双曲正弦** $y=\operatorname{arsinh} x$ <br/>
**反双曲余弦** $y=\operatorname{arcosh} x$ <br/>
**反双曲正切** $y=\operatorname{artanh} x$

### 1.1.11 函数的运算

## 1.2 数列的极限

## 1.3 函数的极限

## 1.4 无穷大与无穷小

## 1.5 极限运算法则

## 1.6 极限存在准则

## 1.7 无穷小的比较

## 1.8 函数的连续性与间断点

## 1.9 连续函数的运算与初等函数的连续性

## 1.10 闭区间上连续函数的性质