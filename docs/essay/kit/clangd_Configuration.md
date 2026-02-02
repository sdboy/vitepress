---
lang: zh-CN
title: Kit
titleTemplate: clangd Configuration
description: clangd Configuration
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: clangd Configuration
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# clangd Configuration 详情

## Files

配置存储在YAML文件中，具体包括：

- 项目（project）配置：
  
  源代码树中的 `.clangd` 文件（clangd会在活动文件的所有父目录中搜索该文件）。
通常应用于共享且已提交的设置。

  （现有命名为 `.clangd` 的目录可删除，这些目录在clangd 11版之前用于临时存储。）

- 用户（user）配置：

  位于操作系统专属目录中的`config.yaml`文件：

  - **Windows**：`%LocalAppData%\clangd\config.yaml`，通常为  `C:\Users\Bob\AppData\Local\clangd\config.yaml`。

  - **macOS**：`~/Library/Preferences/clangd/config.yaml`

  - **Linux及其他系统**：`$XDG_CONFIG_HOME/clangd/config.yaml`，通常为 `~/.config/clangd/config.yaml`。

  私有设置存放于此，可通过`If`条件限定作用域至特定项目。

每个文件可包含多个片段，片段间以 `---` 分隔。（仅当片段具有不同 `If` 条件时才适用）。

JSON是YAML的子集，因此您也可按需使用该语法。

编辑代码时，更改应立即生效。

## 加载并组合片段

默认情况下，用户配置适用于所有打开的文件。项目配置适用于其树下的文件（例如 `proj/.clangd` 配置 `proj/**` 下的文件）。

`If` 条件可进一步限制配置范围，例如仅配置头文件。

当组合配置合理时，系统会自动合并配置。若发生冲突，用户配置优先级最高，其次是内部项目配置，最后是外部项目配置。

## 纲要

在顶级层面上，片段是一种键值（Key-Value）映射，它将文档划分为相关选项的“块”，每个块本身也是键值映射。

在大多数可指定标量值数组的位置，单个值同样有效。例如：`Add: -Wall` 等同于 `Add: [-Wall]`。

## `If`

`If` 块中的条件限制了片段的适用时机。

```yaml
If:                               # Apply this config conditionally
  PathMatch: .*\.h                # to all headers...
  PathExclude: include/llvm-c/.*  # 除位于include/llvm-c/下的文件外
```

每个独立条件必须匹配（通过AND组合）。当某个条件包含多个值时，任意值均可匹配（通过OR组合）。例如：`PathMatch: [foo/.*, bar/.*]` 可匹配任一目录中的文件。

作为一个完整的示例，它可能看起来像这样：

```yaml
# ... Prior fragments
---
If:                               # Apply this config conditionally
  PathMatch: [.*\.h, .*\.c]       # to all headers OR c files
  PathExclude: internal/.*        # 排除位于 "internal" 里的所有文件
CompileFlags:
  Add: [-DEXTERNAL]
---
# ... Further fragments
```

基于文件路径的条件采用以下形式：

- 若片段来自项目目录，则路径为相对路径

- 若片段为全局（如用户配置），则路径为绝对路径

- 路径始终使用正斜杠（UNIX风格）

如果没有文件正在处理，这些条件将不会匹配。

### `PathMatch`

正在处理的文件必须完全匹配正则表达式。

### `PathExclude`

正在处理的文件不应完全匹配正则表达式。

## `CompileFlags`

影响源文件的解析方式。

```yaml
CompileFlags:                     # 调整解析设置
  Add: [-xc++, -Wall]             # 将所有文件视为C++文件，启用更多警告
  Remove: [-W*]                   # 移除所有其他警告相关标志
  Compiler: clang++               # 将编译标志的argv[0]改为`clang++`
```

clangd 模拟了 clang 解析文件的方式。默认情况下，其行为大致等同于 `clang $FILENAME`，但实际项目通常需要设置包含路径（使用 `-I` 标志）、定义预处理器符号、配置警告等操作。

通常，编译数据库会指定这些编译命令。clangd 会在源文件的上级目录中搜索 `compile_commands.json` 文件。

本节将修改编译命令的构建方式。

### `Add`

需附加至编译命令的标志列表。

### `Remove`

需从编译命令中移除的标志列表。

- 若值为可识别的 clang 标志（如 `-I`），则该标志及其所有参数将被移除。同义项（如 `--include-directory=`）也将被移除。

- 否则，若值以 `*` 结尾（如 `-DFOO=*`），则所有以该前缀开头的参数将被移除。

- 否则，所有与值完全匹配的参数将被移除。

所有情况下，必要时也会移除 `-Xclang` 选项。

示例：

- 命令：`clang++ --include-directory=/usr/include -DFOO=42 foo.cc`

- 配置：`Remove: [-I, -DFOO=*]`

- 结果：`clang++ foo.cc`

由同一 CompileFlags 条目添加的标志不会被移除。

### `CompilationDatabase` $\colorbox{green}{clangd-12}$

用于搜索编译数据库（`compile_commands.json` 等）的目录。有效值为：

- 单个目录路径（绝对路径或相对于片段的相对路径）

- 祖先目录：搜索所有父目录（默认值）

- 无：不使用编译数据库，仅使用默认标志。

### `Compiler` $\colorbox{green}{clangd-14}$

用于替换编译标志中可执行文件名称的字符串。该名称控制标志解析（clang 与 clang-cl）、目标推断（gcc-arm-noneabi）等操作。

若该选项与 `--query-driver` 中提及的通配符匹配，则将调用其提取包含路径。

### `BuiltinHeaders` $\colorbox{green}{clangd-21}$

控制Clangd是否应包含其自身的内置头文件（如stddef.h），或使用查询驱动程序找到的系统头文件。

有效值为：

- `Clangd`：使用`clangd`的内置头文件。此为默认值。

- `QueryDriver`：使用通过 `--query-driver` 命令行参数从编译器提取的头文件。若未提供查询驱动程序或驱动程序与编译器不匹配，则回退至 `Clangd` 内置头文件。

```yaml
CompileFlags:
  BuiltinHeaders: QueryDriver
```

> [!NOTE]
> 如果驱动程序不是 Clang，则 `BuiltinHeaders: QueryDriver` 操作将导致 Clang 前端（嵌入在 clangd 中）处理其他编译器的内置头文件，这可能导致意外结果，例如误报诊断信息。

## `Index`

控制 clangd 如何理解当前文件之外的代码。

```yaml
Index:
  Background: Skip     # 禁用这些文件的慢速后台索引。
```

clangd 的索引提供了 clang 解析器无法获取的符号信息，例如传入引用。

### `Background`

是否在后台构建文件以生成项目索引。此选项仅针对翻译单元进行检查，不包括它们包含的头文件。有效值为 `Build`（默认值）或 `Skip`。

### `External` $\colorbox{green}{clangd-12}$

用于定义外部索引源：

- 由 `clangd-indexer` 生成的磁盘上整体索引，或

- [远程索引服务器](https://clangd.llvm.org/guides/remote-index)的地址。

`MountPoint` 可用于指定索引的源根目录。此操作对于处理相对路径转换至关重要。整体架构如下所示：

```yaml
Index:
  External:
    File: /abs/path/to/an/index.idx
    # OR
    Server: my.index.server.com:50051
    MountPoint: /files/under/this/project/
```

- 必须明确指定 `File` 或 `Server` 中的任意一项。

- 若未提供挂载点，`MountPoint` 则默认采用配置片段所在位置，全局配置中必须为绝对路径，本地配置中可为相对路径。

- 声明`External`索引会隐式禁用挂载点下文件的后台索引功能。用户可在后续片段中显式添加 `Background: Build` 指令重新启用该功能。

### `StandardLibrary` $\colorbox{green}{clangd-15}$

控制clangd是否预先索引标准库（以便在空文件中提供标准库符号的代码补全）。示例代码块（默认）。

```yaml
Index:
  StandardLibrary: true
```

## `Style`

描述代码库的风格，不仅限于格式化。

### `FullyQualifiedNamespaces`

始终应使用完全限定名称的命名空间（即不使用`"using"`声明），需完整拼写全名（无论是否包含前缀 `::` ）。所有嵌套命名空间同样受此影响。此规则将影响 `AddUsing` 调整项的可用性。

### `QuotedHeaders` $\colorbox{green}{clangd-20}$

一组正则表达式。路径匹配其中任一正则表达式的头部将使用""语法插入。

### `AngledHeaders` $\colorbox{green}{clangd-20}$

一组正则表达式列表。路径匹配其中任一正则表达式的头部将使用`<>`语法插入。

示例：

```yaml
Style:
  QuotedHeaders: "src/.*"
  AngledHeaders: ["path/sdk/.*", "third-party/.*"]
```

## `Diagnostics` $\colorbox{green}{clangd-12}$

### `Suppress`

应被抑制的诊断代码。

有效值为：

- `'*'`，用于禁用所有诊断

- clangd 暴露的诊断代码（例如 `unknown_type`、`-Wunused-result`）

- clang 内部诊断代码（例如 `err_unknown_type`）

- 警告类别（例如 `unused-result`）

- clang-tidy 检查名称（例如 `bugprone-narrowing-conversions`）

这是一个简单的过滤器。诊断功能可以通过其他方式控制（例如禁用 clang-tidy 检查，或使用 `-Wunused` 编译标志）。这通常还具有其他优势，例如跳过某些分析。

### `ClangTidy`

配置 clang-tidy 处理文件的方式。

这些设置将与 .clang-tidy 配置文件中的设置合并，其中 clangd 配置文件中的设置具有优先级。

#### `Add`

[检查](https://clang.llvm.org/extra/clang-tidy/checks/list.html)项列表。这些可以是通配符，例如添加：`'bugprone-*'`。

#### `Remove`

需禁用的检查项列表，可包含通配符。

此设置优先于添加检查项，支持启用模块中除特定检查外的所有检查。

示例：启用modernize模块所有检查项，但排除"使用尾部返回类型"检查：

```yaml
Diagnostics:
  ClangTidy:
    Add: modernize*
    Remove: modernize-use-trailing-return-type
```

#### `CheckOptions`

clang-tidy 检查项的键值对选项。所有检查项的可用选项可在[此处](https://clang.llvm.org/extra/clang-tidy/checks/list.html)查阅。

请注意此处的格式与 `.clang-tidy` 配置文件略有不同，我们不采用 `key: <key>, value: <value>` 的写法，而是直接使用 `<key>: <value>` 形式。

```yaml
Diagnostics:
  ClangTidy:
    CheckOptions:
      readability-identifier-naming.VariableCase: CamelCase
```

#### `FastCheckFilter` $\colorbox{green}{clangd-18}$

是否运行可能降低 clangd 运行速度的 clang-tidy 检查。

有效值为：

- `Strict`：仅运行经测速确认快速的检查。这将排除近期新增且尚未测速的检查项。此为默认设置。

- `Loose`：除非已知检查速度较慢，否则均运行检查。

- `None`：无论检查速度如何均运行检查。

```yaml
Diagnostics:
  ClangTidy:
    FastCheckFilter: Strict
```

### `UnusedIncludes` $\colorbox{green}{clangd-14}$

启用 Include Cleaner 的[未使用包含诊断](https://clangd.llvm.org/design/include-cleaner)功能。可能值：`None`、`Strict`（自 clangd 17 起默认值）。

```yaml
Diagnostics:
  UnusedIncludes: Strict
```

### `Includes`

#### `IgnoreHeader` $\colorbox{green}{clangd-15}$

正则表达式列表。包含 Cleaner 不会为路径与其中任何一个后缀匹配的头部生成诊断信息。

#### `AnalyzeAngledIncludes` $\colorbox{green}{clangd-19}$

一个布尔值，用于启用/禁用对非标准库来源的未使用斜杠包含文件的检测。默认禁用以避免由伞式头文件引发的误报。

#### `MissingIncludes` $\colorbox{green}{clangd-17}$

启用 Include Cleaner 的[缺失包含诊断](https://clangd.llvm.org/design/include-cleaner)功能。可选值：`Node`（默认）、`Strict`。

## `Completion`

配置代码补全功能。示例代码块（默认）：

```yaml
Completion:
  AllScopes: Yes
  ArgumentLists: FullPlaceholders
  HeaderInsertion: IWYU
  CodePatterns: All
  MacroFilter: ExactPrefix
```

### `AllScopes` $\colorbox{green}{clangd-13}$

代码补全是否应包含不可见作用域的建议。所需的作用域前缀将被插入。默认值为 `Yes`。

### `ArgumentLists` $\colorbox{green}{clangd-20}$

确定在函数调用补全时，参数列表位置插入的内容。以下是有效值及其对应行为示例假设存在函数 `foo(int arg)`（`^` 代表光标位置）：

- `None`：`fo^` 补全为 `foo^`

- `OpenDelimiter`：`fo^` 补全为 `foo(^`

- `Delimiters`：`fo^` 补全为 `foo(^)`

- `FullPlaceholders`：`fo^` 补全为 `foo(int arg)`，其中 `int arg` 被选中

默认值为 `FullPlaceholders`。

此选项同样管理模板名称的补全，此时分隔符为 `<>`。

### `HeaderInsertion` $\colorbox{green}{clangd-21}$

在接受代码补全时添加 `#include`指令。相当于CLI选项 `--header-insertion` 的配置项。有效值为：

- `IWYU`：包含你使用的头文件。为顶级符号插入所属头文件，除非该头文件已被直接包含或符号已被前向声明。此为默认值。

- `Never`：永不插入头文件。

### `CodePatterns` $\colorbox{green}{clangd-21}$

代码补全功能将建议代码片段和代码模式。有效值为：

- `All`：建议所有代码片段和模式。

- `None`：不建议任何代码片段和模式。

默认值为 `All`。

### `MacroFilter` $\colorbox{green}{clangd-22}$

控制代码补全时采用精确匹配还是模糊匹配来决定提供哪些宏符号。

有效值为：

- `ExactPrefix`：仅建议名称与光标前标记精确前缀匹配的宏。此为默认值。

- `FuzzyMatch`：包含名称与光标前标记模糊匹配的宏建议，类似于非宏符号的处理方式。名称以下划线开头或结尾的宏仍会被排除在模糊匹配结果之外，以避免干扰（例如系统头文件定义了大量此类宏）。

## `InlayHints` $\colorbox{green}{clangd-14}$

配置嵌入提示功能的行为。示例块（默认）：

```yaml
InlayHints:
  BlockEnd: false
  Designators: true
  Enabled: true
  ParameterNames: true
  DeducedTypes: true
  DefaultArguments: false
  TypeNameLimit: 24
```

### `Enabled` $\colorbox{green}{clangd-14}$

一个布尔值，用于启用/禁用所有类型的嵌入提示功能。当禁用时，特定类型的配置将被忽略。

### `ParameterNames` $\colorbox{green}{clangd-14}$

一个布尔值，用于启用/禁用函数调用中参数名称的嵌入提示。

### `DeducedTypes` $\colorbox{green}{clangd-14}$

一个布尔值，用于启用/禁用推导类型的嵌入提示。

### `Designators` $\colorbox{green}{clangd-14}$

一个布尔值，用于启用/禁用聚合初始化中对标识符的嵌入提示。（例如：`Designators:true`：`std::vector<int> arr = {[0]= 1, [1]= 2}`；`Designators: true`：`std::vector<int> arr = {1, 2}`）

### `BlockEnd` $\colorbox{green}{clangd-17}$

一个布尔值，用于启用/禁用块末尾注释的嵌入提示。示例如下（注释即为嵌入提示）：

```c++
void foo() {
  struct S {
  }; // struct S
} // foo
```

### `DefaultArguments` $\colorbox{green}{clangd-20}$

一个布尔值，用于启用/禁用默认参数的嵌入提示。示例：

```c++
void foo(int a, int b = 42);
void bar() {
  // This line will be displayed as `foo(a: 41, b: 42);`
  // The `a:` is the usual parameter hint.
  // The `, b: 42` is a default argument hint.
  foo(41);
}
```

### `TypeNameLimit` $\colorbox{green}{clangd-17}$

类型提示的字符限制。超过限制的提示将不显示。`0`表示无限制。

## `Hover` $\colorbox{green}{clangd-14}$

配置悬停卡片的内容。示例块（默认）：

```yaml
Hover:
  ShowAKA: false
  MacroContentsLimit: 2048
```

### `ShowAKA` $\colorbox{green}{clangd-14}$

一个布尔值，用于控制是否打印去糖化类型，例如：`vector<int>::value_type`（即 `int`）

### `MacroContentsLimit` $\colorbox{green}{clangd-22}$

悬停宏展开的字符限制。超过限制的展开内容不会显示。`0`表示无限制。

默认值为 `2048`。

## `SematicTokens` $\colorbox{green}{clangd-17}$

配置语义高亮。示例代码块（默认）：

```yaml
SemanticTokens:
  DisabledKinds: []
  DisabledModifiers: []
```

### `DisabledKinds` $\colorbox{green}{clangd-17}$

指定clangd不应发送给客户端的语义标记类型。

可用类型可在[类型列](https://clangd.llvm.org/features#kinds)中找到。

### `DisabledModifiers` $\colorbox{green}{clangd-17}$

指定clangd不应发送给客户端的语义标记修饰符。

可用修饰符可在[修饰符列](https://clangd.llvm.org/features#modifiers)中找到。

## `Documentation` $\colorbox{green}{clangd-22}$

指定服务器端文档代码注释的解释方式。影响发送至客户端用于悬停提示和代码补全的文档字符串格式。示例代码块（默认）：

```yaml
Documentation:
  CommentFormat: Plaintext
```

### `CommentFormat`

确定代码文档的注释格式。

- `Plaintext`：将代码文档解释为纯文本。Markdown 特定语法将被转义。在支持 Markdown 的客户端上，这将导致显示 Markdown 语法而不进行渲染。例如，在文档注释中使用 `**粗体文本**` 将显示为 `**粗体文本**`，而非悬停/代码补全时的**粗体文本**。

- `Markdown`：将文档注释解释为Markdown格式。除HTML标签外，Markdown语法不会被转义。在支持Markdown的客户端中，所有Markdown语法均会渲染显示。

- `Doxygen`：将代码文档解析为[Doxygen](https://www.doxygen.nl/)注释。除按Markdown处理文档外，还将使用Clang的Doxygen解析器进行解析。该模式会突出显示使用的Doxygen命令，将Doxygen命令转换为Markdown语法，并扩展悬停内容（例如添加函数参数或返回值文档）。

## 参考

[clangd Configuration](https://clangd.llvm.org/config)