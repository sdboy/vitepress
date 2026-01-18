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
$$
\begin{align}
\sinh (x+y) &= \sinh x\cosh y+\cosh x\sinh y \tag{1} \\
\sinh (x-y) &= \sinh x\cosh y-\cosh x\sinh y \tag{2} \\
\cosh (x+y) &= \cosh x\cosh y+\sinh x\sinh y \tag{3} \\
\cosh (x-y) &= \cosh x\cosh y-\sinh x\sinh y \tag{4}
\end{align}
$$

$\operatorname{arsinh}(x) = \ln\left(x + \sqrt{x^2 + 1}\right)$

**反双曲正弦** $y=\operatorname{arsinh} x$ <br/>
**反双曲余弦** $y=\operatorname{arcosh} x$ <br/>
**反双曲正切** $y=\operatorname{artanh} x$

### 1.1.11 函数的运算

设函数 $f(x)$，$g(x)$ 的定义域依次为 $D_1$，$D_2$，$D=D_1\cap D_2\neq \emptyset$，则我们可以定义这两个函数的下列运算：<br/>
乘（除） $f\times g$：$(f\times g)(x)=f(x)\times g(x),x\in D$ <br/>
和（差）$f\pm g$：$(f\pm g)(x)=f(x)\pm g(x),x\in D$ <br/>
积 $f\bullet g$：$(f\bullet g)(x)=f(x)\bullet g(x),x\in D$ <br/>
商 $\frac{f}{g}$：$(\frac{f}{g})(x)=\frac{f(x)}{g(x)},x\in D\setminus \{x|g(x)=0,x\in D\}$

## 1.2 数列的极限

### 1.2.1 数列的极限的定义

数列的概念：如果按照某一法则，对每个 $n\in \mathbb{N^+}$，对应一个确定的实数 $x_n$，这些实数 $x_n$ 按照下标 $n$ 从小到大排列得到的一个序列 $x_1,x_2,x_3,\ldots,x_n,\dots$ ，就叫做**数列**，简记为数列 $\{x_n\}$。

数列中的每一个数叫做数列的项，第 $n$ 项为 $x_n$ 叫做数列的**一般项**。

**定义：设 $\{x_n\}$ 为一个数列，如果存在一个常数 $a$，对于任意给定的正数 $\varepsilon$（不论它多么小），总存在正整数 $\mathbb{N}$，使得当 $n>N$ 时，不等式** 
$$
|x_n-a|<\varepsilon
$$ 
**都成立，那么就称常数 $a$ 是数列 $\{x_n\}$ 的极限，或者称数列 $\{x_n\}$ 收敛于 $a$，记为**
$$
\lim\limits_{n\to \infty} x_n=a,
$$
**或** 
$$
x_n\to a(n\to \infty)
$$

$$
\lim\limits_{n\to \infty} x_n=a\Leftrightarrow \forall \varepsilon>0,\exists N\in \mathbb{N^+}, 当 n>N 时, 总有 |x_n-a|<\varepsilon
$$

如果不存在这样的常数 $a$，则说数列 $\{x_n\}$ 没有极限，或者说数列 $\{x_n\}$ 是发散的，习惯也说 $\lim\limits_{n\to \infty} x_n$ 不存在。

> [!NOTE]
> 正整数 $\varepsilon$ 可以任意给定是很重要的，因为只有这样，不等式 $|x_n-a|<\varepsilon$ 才能表达出 $x_n$ 与 $a$ 无限接近的意思。<br/>
> 定义中的正整数 $N$ 是与任意给定的正整 $\varepsilon$ 有关的，它随着 $\varepsilon$ 的给定而选定。

> [!CAUTION]
> 数列的极限是指当 $n$ 接近于 $\infty$ 时，数列的项与给定常数 $a$ 无限接近，而不是指数列的上界或下界。

例子：
- $3,3,3,3,\ldots,3$ 的数列的极限是 $3$
- $2,3,7,6,3,\ldots,3$ 的数列的极限是 $3$
- $1,\frac{2}{3},\frac{3}{5},\frac{n}{2n-1},\ldots$ 的数列的极限是 $\frac{1}{2}$
  $$
  \begin{align}
  |\frac{n}{2n-1}-\frac{1}{2}| &= |\frac{n-0.5}{2n-1}+\frac{0.5}{2n-1}-\frac{1}{2}| \\
  &= \frac{1}{4n-2}
  \end{align}
  $$
  当 $n\to \infty$ 时，有$\frac{1}{4n-2} < 任何正数$<br/>
  当 $\varepsilon=\frac{1}{10}$ 时，有 $N=3$，当 $n>N$ 时，有 $\frac{1}{4n-2} < \frac{1}{10}$<br/>
  当 $\varepsilon=\frac{1}{10000}$ 时，有 $N=4000$，当 $n>N$ 时，有 $\frac{1}{4n-2} < \frac{1}{10000}$<br/>
  当 $\varepsilon=\frac{1}{1\times 10^{11}}$ 时，有 $N=5\times 10^{10}$，当 $n>N$ 时，有 $\frac{1}{4n-2} < \frac{1}{1\times 10^{11}}$<br/>
  

> [!TIP]
> 无条件小于任何正数的数是0（绝对0）<br/>
> 有条件（$n\to \infty$ 时）小于任何正数的数是0（相对0）

### 1.2.2 收敛数列的性质

- **定理一（极限的唯一性）：如果数列 $\{x_n\}$ 收敛，那么它的极限唯一**

- **定理二（收敛数列的有界性）：如果数列 $\{x_n\}$ 收敛，那么数列 $\{x_n\}$ 一定是有界的**
> [!NOTE]
> 如果数列 $\{x_n\}$ 无界，那么 $\{x_n\}$ 一定发散<br/>
> 有界数列不一定收敛，如 $\{(-1)^{n+1}\}$

- **定理三（收敛数列的保号性）：如果数列 $\lim\limits_{n\to \infty} x_n=a$，且 $a > 0$（或 $a < 0$），那么存在正整数 $N>0$，当 $n>N$ 时，都有 $x_n>0$（或 $x_n<0$）。**

  **推论**：如果数列 $\{x_n\}$ 从某项起有 $x_n\geq 0$（或 $x_n\leq 0$），且 $\lim\limits_{n\to \infty} x_n=a$，那么 $a\geq 0$（或 $a\leq 0$）
  
  > [!NOTE]
  > 数列每一项都大于0，数列的极限也可能等于0

  在数列 $\{x_n\}$ 中任意抽取无限多项并保持这些项在原数列 $\{x_n\}$ 就的先后顺序不，这样得到的一个数列称为原数列 $\{x_n\}$的<u>子数列</u>（或<u>子列</u>）**<br/>
  $$
  x_{n_1},x_{n_2},x_{n_3},\dots,x_{n_k},\dots
  $$
  数列 $\{x_{n_k}\}$ 就是数列 $\{x_n\}$ 的子数列
  > [!TIP]
  > 在子数列 $\{x_{n_k}\}$ 中，一般项 $x_{n_k}$ 是第 $k$ 项，而 $x_{n_k}$ 在原数列 $\{x_n\}$ 中对应的项是第 $n_k$ 项，显然 $n_k\geq k$

- **定理四（收敛数列与其子数列间的关系）：如果数列 $\{x_n\}$ 收敛于 $a$，那么它的任意子数列也收敛，且极限也是 $a$**

  > [!NOTE]
  > 如果数列 $\{x_n\}$ 有两个子数列收敛于不同的极限，那么数列 $\{x_n\}$ 一定是发散的

> [!IMPORTANT]
> 收敛 $\Rightarrow$ 有界<br/>
> 收敛 $\nLeftarrow$ 有界<br/>
> 发散 $\Rightarrow$ 无界<br/>
> 发散 $\nLeftarrow$ 无界<br/>

## 1.3 函数的极限

### 1.3.1 函数极限的定义

函数极限的一般概念：在自变晨的某个变化过程中，如果对应的函数值无限接近于某个确定的数，那么这个确定的数就叫做在这一变化过程中函数的极限。

> [!NOTE]
> ➀自变量 $x$ 任意地接近于有限值 $x_0$ 或者说趋于有限值 $x_0$（记作 $x\to x_0$）时，对应的函数值 $f(x)$ 的变化情形<br/>
> ➁自变量 $x$ 的绝对值 $|x|$ 无限增大即趋于无穷大（记作 $x\to \infty$）时，对应的函数值 $f(x)$ 的变化情形

#### 1.3.1.1 自变量趋于有限值时函数的极限

**定义：设函数 $f(x)$ 在点 $x_0$ 的某一去心邻域内有定义。如果存在常数 $A$，对于任意给定的正数 $\varepsilon$（不论它多么小），总存在正数 $\delta$，使得当 $x$ 满足不等式 $0<|x-x_0|<\delta$ 时，对应的函数值 $f(x)$ 都满足不等式**
$$
|f(x)-A|<\varepsilon,
$$
**那么常数 $A$ 就叫做<u>函数 $f(x)$ 当 $x\to x_0$ 时的极限</u>，记作**
$$ 
\lim\limits_{x\to x_0} f(x)=A 或 f(x)\to A(当x\to x_0)
$$

- **左极限**
  
  $x$ 仅从 $x_0$ 的左侧趋于 $x_0$（记作 $x\to {x_0}^-$）的情形，$x$ 在 $x_0$ 的左侧，$x<x_0$。在$\lim\limits_{x\to x_0} f(x)=A$ 的定义中，把 $0<|x-x_0|<\delta$ 改为 $x_0-\delta <x<x_0$，那么 $A$ 就叫做函数 $f(x)$ 当 $x\to x_0$ 时的<u>左极限</u>，记作
  $$ 
  \lim\limits_{x\to {x_0}^-} f(x)=A 或 f({x_0}^-)=A
  $$

- **右极限**
  
  $x$ 仅从 $x_0$ 的右侧趋于 $x_0$（记作 $x\to {x_0}^+$）的情形，$x$ 在 $x_0$ 的右侧，$x>x_0$。在$\lim\limits_{x\to x_0} f(x)=A$ 的定义中，把 $0<|x-x_0|<\delta$ 改为 $x_0<x<x_0+\delta$，那么 $A$ 就叫做函数 $f(x)$ 当 $x\to x_0$ 时的<u>右极限</u>，记作
  $$
  \lim\limits_{x\to {x_0}^+} f(x)=A 或 f({x_0}^+)=A
  $$

  左极限和右极限统称为<u>单侧极限</u>

  > [!TIP]
  > 函数 $f(x)$ 当 $x\to x_0$ 时极限存在的充分必要条件是左极限及右极限各自都存在且相等，即
  > $$ 
  > f({x_0}^-)=f({x_0}^+)
  > $$
  > 因此，即使 $f({x_0}^-)$ 和 $f({x_0}^+)$ 都存在，但若不相等，则函数 $f(x)$ 当 $x\to x_0$ 也不存在

#### 1.3.1.2 自变量趋于无穷大时函数的极限

如果在 $x\to \infty$ 的过程中，对应的函数值 $f(x)$ 无限接近于确定的数值 $A$，那么 $A$ 就叫做函数 $f(x)$ 当 $x\to \infty$ 时的极限。

**定义：设函数 $f(x)$ 当 $|x|$ 大于某一正数时有定义。如果存在常数 $A$，对于任意给定的正数 $\varepsilon$（不论它多么小），总存在着正数 $X$，使得当 $x$ 满足不等式 $|x|>X$ 时，对应的函数值 $f(x)$ 都满足不等式**
$$ 
|f(x)-A|<\varepsilon,
$$
**那么常数 $A$ 就叫做<u>函数 $f(x)$ 当 $x\to \infty$ 时的极限</u>，记作**
$$ 
\lim\limits_{x\to \infty} f(x)=A 或 f(x)\to A(当x\to \infty)
$$

### 1.3.2 函数极限的性质

- **定理一（函数极限的唯一性） 如果 $\lim\limits_{x\to x_0} f(x)$ 存在，那么这极限唯一**

- **定理二（函数极限的局部有限性） 如果 $\lim\limits_{x\to x_0} f(x)=A$，那么存在常数 $M>0$ 和 $\delta>0$，使得当 $0<|x-x_0|<\delta$ 时，$|f(x)|\leqslant M$**

- **定理三（函数极限的局部保号性） 如果 $\lim\limits_{x\to x_0} f(x)=A$，且 $A>0$（或 $A<0$），那么存在常数 $\delta>0$，使得当 $0<|x-x_0|<\delta$ 时，有 $f(x)>0$（或 $f(x)<0$）**

- **定理三$^\prime$ 如果 $\lim\limits_{x\to x_0} f(x)=A$（$A\neq 0$），那么就存在着 $x_0$ 的某一去心邻域 $\mathring{U}(x_0)$，当 $x\in \mathring{U}(x_0)$ 时，就有$|f(x)|>\frac{|A|}{2}$**

  **推论** 如果在 $x_0$ 的某去心邻域内 $f(x)\geqslant 0$（或 $f(x)\leqslant 0$），而且 $\lim\limits_{x\to x_0} f(x)=A$，那么 $A\geqslant 0$（或 $A\leqslant 0$）

- **定理四（函数极限与数列极限的关系） 如果极限 $\lim\limits_{x\to x_0} f(x)$ 存在，$\{x_n\}$ 为函数 $f(x)$ 的定义域内任一收敛于 $x_0$ 的数列，且满足：$x_n\neq x_0$（$n\in \mathbb{N^+}$），那么相应的函数值数列 $\{f(x_n)\}$ 必收敛，且 $\lim\limits_{n\to \infty} f(x_n)=\lim\limits_{x\to x_0} f(x)$。**

## 1.4 无穷大与无穷小

### 1.4.1 无穷小

### 1.4.2 无穷大


## 1.5 极限运算法则

## 1.6 极限存在准则

## 1.7 无穷小的比较

## 1.8 函数的连续性与间断点

## 1.9 连续函数的运算与初等函数的连续性

## 1.10 闭区间上连续函数的性质