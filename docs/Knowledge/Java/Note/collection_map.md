---
lang: zh-CN
title: collection map
titleTemplate: Java
description: collection map
head:
  - - meta
    - name: description
      content: collection map
  - - meta
    - name: keywords
      content: collection map java
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: true
footer: true
---
# Java 集合底层原理

---

## 一、List（有序、可重复）

| 实现类 | 底层结构 | 特点 | 时间复杂度 |
| :-- | :-- | :-- | :-- |
| `ArrayList` | **动态数组** | 随机访问快，增删慢 | 查 O(1) / 增删 O(n) |
| `LinkedList` | **双向链表** | 增删快，随机访问慢 | 查 O(n) / 增删 O(1) |
| `Vector` | **动态数组**（线程安全） | 已淘汰 | 查 O(1) / 增删 O(n) |

---

### ArrayList 原理

```java
// 默认容量 10
Object[] elementData;

// 扩容机制：原容量 × 1.5
// 10 → 15 → 22 → 33 → ...

// 随机访问快
E get(int index) {
    return elementData[index];  // O(1)
}

// 中间插入慢（需要移动元素）
void add(int index, E element) {
    System.arraycopy(...);  // O(n)
}
```

---

### LinkedList 原理

```java
// 双向链表
Node<E> first;
Node<E> last;

static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
}

// 头尾插入快
void addFirst(E e) { }  // O(1)
void addLast(E e) { }   // O(1)

// 随机访问慢（需要遍历）
E get(int index) { }    // O(n)
```

---

## 二、Set（无序、不可重复）

| 实现类 | 底层结构 | 特点 | 时间复杂度 |
| :-- | :-- | :-- | :-- |
| `HashSet` | **HashMap** | 无序 | O(1) |
| `LinkedHashSet` | **LinkedHashMap** | 插入顺序 | O(1) |
| `TreeSet` | **TreeMap（红黑树）** | 排序 | O(log n) |

---

### HashSet 原理

```java
// 底层是 HashMap
private transient HashMap<E,Object> map;
private static final Object PRESENT = new Object();

// add 方法
public boolean add(E e) {
    return map.put(e, PRESENT) == null;  // key 重复则添加失败
}

// 去重原理：hashCode() + equals()
```

---

### TreeSet 原理

```java
// 底层是 TreeMap（红黑树）
private transient NavigableMap<E,Object> m;

// 元素必须实现 Comparable 或提供 Comparator
public int compareTo(E o);

// 自动排序
//     5
//    / \
//   3   8
//  / \
// 1   4
```

---

## 三、Queue（队列）

| 实现类 | 底层结构 | 特点 |
| :-- | :-- | :-- |
| `PriorityQueue` | **堆（二叉树）** | 优先级队列 |
| `ArrayDeque` | **数组** | 双端队列 |

---

### PriorityQueue 原理

```java
// 底层是完全二叉树（小顶堆）
Object[] queue;
int size = 0;

// 队头永远是最小元素
//       1
//      / \
//     3   2
//    / \
//   5   4

// 插入/删除：O(log n)
```

---

### ArrayDeque 原理

```java
// 循环数组
Object[] elements;
int head;  // 头指针
int tail;  // 尾指针

// 扩容：原容量 × 2
// 支持 O(1) 头尾操作
```

---

## 四、Map（键值对）

| 实现类 | 底层结构 | 特点 | 时间复杂度 |
| :-- | :-- | :-- | :-- |
| `HashMap` | **数组 + 链表 + 红黑树** | 无序 | O(1) |
| `LinkedHashMap` | **HashMap + 双向链表** | 插入顺序 | O(1) |
| `TreeMap` | **红黑树** | 排序 | O(log n) |
| `Hashtable` | **数组 + 链表**（线程安全） | 已淘汰 | O(1) |

---

### HashMap 原理（重点）

```java
// Java 8+ 结构
// 数组 + 链表 + 红黑树

transient Node<K,V>[] table;

static class Node<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;  // 链表指针
}

// 扩容机制：容量 × 2
// 默认容量 16，负载因子 0.75
// 阈值 = 16 × 0.75 = 12
```

**HashMap 结构图：**

```
数组
┌─────────────────────────────────┐
│  0  │  1  │  2  │  3  │  4  │...│
└─────┴─────┴─────┴─────┴─────┴───┘
           │           │
           ▼           ▼
        ┌──────┐   ┌──────┐
        │Node1 │   │Node1 │
        ├──────┤   ├──────┤
        │Node2 │   │Node2 │ (链表长度>8 转红黑树)
        ├──────┤   ├──────┤
        │Node3 │   │Node3 │
        └──────┘   └──────┘
```

---

### HashMap 关键机制

```java
// 1. hash 计算
hash = key.hashCode() ^ (hashCode >>> 16);

// 2. 索引计算
index = (n - 1) & hash;  // n = 数组长度

// 3. 链表转红黑树（Java 8+）
// 链表长度 > 8 且 数组长度 >= 64

// 4. 扩容
// 新容量 = 原容量 × 2
// 重新 hash 分布
```

---

### LinkedHashMap 原理

```java
// HashMap + 双向链表
// 保持插入顺序或访问顺序

static class Entry<K,V> extends HashMap.Node<K,V> {
    Entry<K,V> before, after;  // 双向链表
}

// 遍历顺序 = 插入顺序
```

---

## 五、对比总结

| 集合 | 底层结构 | 有序性 | 重复性 | null 值 | 线程安全 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `ArrayList` | 数组 | ✅ 索引顺序 | ✅ | ✅ | ❌ |
| `LinkedList` | 链表 | ✅ 插入顺序 | ✅ | ✅ | ❌ |
| `HashSet` | HashMap | ❌ | ❌ | ✅ | ❌ |
| `LinkedHashSet` | LinkedHashMap | ✅ 插入顺序 | ❌ | ✅ | ❌ |
| `TreeSet` | 红黑树 | ✅ 排序 | ❌ | ❌ | ❌ |
| `HashMap` | 数组 + 链表 + 树 | ❌ | key❌ value✅ | ✅ | ❌ |
| `LinkedHashMap` | HashMap+ 链表 | ✅ 插入顺序 | key❌ value✅ | ✅ | ❌ |
| `TreeMap` | 红黑树 | ✅ 排序 | key❌ value✅ | key❌ | ❌ |
| `PriorityQueue` | 堆 | ✅ 优先级 | ✅ | ❌ | ❌ |

---

## 六、选择建议

| 需求 | 推荐 |
| :-- | :-- |
| 随机访问多 | `ArrayList` |
| 增删操作多 | `LinkedList` |
| 去重 | `HashSet` |
| 保持插入顺序 | `LinkedHashSet` / `LinkedHashMap` |
| 排序 | `TreeSet` / `TreeMap` |
| 优先级队列 | `PriorityQueue` |
| 线程安全 | `CopyOnWriteArrayList` / `ConcurrentHashMap` |