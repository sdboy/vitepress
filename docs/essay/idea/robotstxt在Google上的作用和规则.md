---
lang: zh-CN
title: Idea
titleTemplate: robots.txt在Google上的作用和规则
description: robots.txt在Google上的作用和规则
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: robots.txt google
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# robots.txt文件作用和规则

## robots.txt 简介

robots.txt 文件规定了搜索引擎抓取工具可以访问您网站上的哪些网址。 此文件主要用于避免您的网站收到过多请求；它并不是一种阻止 Google 抓取某个网页的机制。若想阻止 Google 访问某个网页，请[使用 noindex 禁止将其编入索引](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=zh-cn)，或使用密码保护该网页。

> [!TIP]
> **如果您使用了 Wix 或 Blogger 等 CMS**，则可能无需（或无法）直接修改 robots.txt 文件。您的 CMS 可能会通过显示搜索设置页面或借用其他某种方式，让您告知搜索引擎是否应抓取您的网页。
> 如果您想向搜索引擎隐藏/取消隐藏您的某个网页，请搜索以下说明：如何在 CMS 上修改网页在搜索引擎中的可见性（例如搜索“Wix 向搜索引擎隐藏网页”）。

## robots.txt 文件有何用途？

robots.txt 文件主要用于管理流向您网站的抓取工具流量，通常用于阻止 Google 访问某个文件（具体取决于文件类型）,**robots.txt 对不同文件类型的影响：**
- 网页<br>
  对于网页（包括 HTML、PDF，或其他 Google 能够读取的非媒体格式），您可在以下情况下使用 robots.txt 文件管理抓取流量：您认为来自 Google 抓取工具的请求会导致您的服务器超负荷；或者，您不想让 Google 抓取您网站上的不重要网页或相似网页。<br> 
  > [!WARNING] 
  > 如果您不想让自己的网页（包括 PDF 和受 [Google 支持的其他基于文本的格式](https://developers.google.com/search/docs/crawling-indexing/indexable-file-types?hl=zh-cn)）显示在 Google 搜索结果中，请不要将 robots.txt 文件用作隐藏网页的方法。
  > 如果其他网页通过使用说明性文字指向您的网页，Google 在不访问您网页的情况下仍能将其网址编入索引。如果您想从搜索结果中屏蔽自己的网页，请改用其他方法，例如使用密码保护或 [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=zh-cn)。
  
  如果您使用 robots.txt 文件阻止 Google 抓取您的网页，则其网址仍可能会显示在搜索结果中，但搜索结果[不会包含对该网页的说明](https://support.google.com/webmasters/answer/7489871?hl=zh-cn)。而且，内嵌在被屏蔽的网页中的图片文件、视频文件、PDF 文件和其他非 HTML 文件都会被排除在抓取范围之外，除非有其他允许抓取的网页引用了这些文件。如果您看到了这样一条与您网页对应的搜索结果并想修正它，请移除用于屏蔽该网页的 robots.txt 条目。如果您想从 Google 搜索结果中完全隐藏该网页，请改用[其他方法](https://developers.google.com/search/docs/crawling-indexing/remove-information?hl=zh-cn#i-control-the-web-page)。

- 媒体文件<br>
  您可以使用 robots.txt 文件管理抓取流量并阻止图片、视频和音频文件出现在 Google 搜索结果中。这不会阻止其他网页或用户链接到您的图片/视频/音频文件。

  - [详细了解如何阻止图片显示在 Google 中](https://developers.google.com/search/docs/crawling-indexing/prevent-images-on-your-page?hl=zh-cn)。
  - [详细了解如何从 Google 中移除您的视频文件或限制您的视频文件显示在 Google 上](https://developers.google.com/search/docs/appearance/video?hl=zh-cn#remove)。
- 资源文件<br>
  如果您认为在加载网页时跳过诸如不重要的图片、脚本或样式文件之类的资源不会对网页造成太大影响，您可以使用 robots.txt 文件屏蔽此类资源。不过，如果缺少此类资源会导致 Google 抓取工具更难解读网页，请勿屏蔽此类资源，否则 Google 将无法有效分析有赖于此类资源的网页。

## 了解 robots.txt 文件的限制

在创建或修改 robots.txt 文件之前，您应了解这种网址屏蔽方法的限制。根据您的目标和具体情况，您可能需要考虑采用其他机制来确保搜索引擎无法在网络上找到您的网址。

- 并非所有搜索引擎都支持 robots.txt 规则。<br>
  robots.txt 文件中的命令并不能强制规范抓取工具对网站采取的行为；是否遵循这些命令由抓取工具自行决定。Googlebot 和其他正规的网页抓取工具都会遵循 robots.txt 文件中的命令，但其他抓取工具未必如此。因此，如果您想确保特定信息不会被网页抓取工具抓取，我们建议您采用其他屏蔽方法，例如[用密码保护您服务器上的隐私文件](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share?hl=zh-cn)。

- 不同的抓取工具会以不同的方式解析语法。<br>
  虽然正规的网页抓取工具会遵循 robots.txt 文件中的规则，但每种抓取工具可能会以不同的方式解析这些规则。您需要好好了解一下适用于不同网页抓取工具的[正确语法](#如何编写-robotstxt-规则)，因为有些抓取工具可能会无法理解某些命令。

- 如果其他网站上有链接指向被 robots.txt 文件屏蔽的网页，则此网页仍可能会被编入索引。<br>
  尽管 Google 不会抓取被 robots.txt 文件屏蔽的内容或将其编入索引，但如果网络上的其他位置有链接指向被禁止访问的网址，我们仍可能会找到该网址并将其编入索引。因此，相关网址和其他公开显示的信息（如相关页面链接中的定位文字）仍可能会出现在 Google 搜索结果中。若要正确阻止您的网址出现在 Google 搜索结果中，您应[为服务器上的文件设置密码保护、使用 noindex meta 标记或响应标头](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=zh-cn)，或者彻底移除网页。

> [!WARNING]
> 混用多种抓取规则和索引编制规则可能会导致某些规则与其他规则产生冲突。了解如何[合并使用抓取规则与索引编制及内容显示规则](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=zh-cn#combining)。

## 创建或更新 robots.txt 文件

> [!TIP]
> 如果您使用了 Wix 或 Blogger 等网站托管服务，则可能无需（或无法）直接修改 robots.txt 文件。您的托管服务提供商可能会通过显示搜索设置页面或借用其他某种方式，让您告知搜索引擎是否应抓取您的网页。
> 如果您想向搜索引擎隐藏/取消隐藏您的某个网页，请搜索以下说明：如何在托管服务上修改网页在搜索引擎中的可见性，例如搜索“Wix 向搜索引擎隐藏网页”。

您可以使用 robots.txt 文件[控制抓取工具可以访问您网站上的哪些文件](#robotstxt-文件有何用途)。

robots.txt 文件应位于网站的根目录下。因此，对于网站 `www.example.com`，robots.txt 文件的路径应为 `www.example.com/robots.txt`。robots.txt 是一种遵循[漫游器排除标准](https://en.wikipedia.org/wiki/Robots_exclusion_standard#About_the_standard)的纯文本文件，由一条或多条规则组成。每条规则可禁止或允许所有或特定抓取工具抓取托管 robots.txt 文件的网域或子网域上的指定文件路径。除非您在 robots.txt 文件中另行指定，否则所有文件均隐式允许抓取。

下面是一个包含两条规则的简单 robots.txt 文件：
```txt
User-agent: Googlebot
Disallow: /nogooglebot/

User-agent: *
Allow: /

Sitemap: https://www.example.com/sitemap.xml
```

以下是该 robots.txt 文件的含义：

1. 名为 Googlebot 的用户代理不能抓取任何以 `https://example.com/nogooglebot/` 开头的网址。

2. 其他所有用户代理均可抓取整个网站。不指定这条规则也无妨，结果是一样的；默认行为是用户代理可以抓取整个网站。

3. 该网站的[站点地图文件](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview?hl=zh-cn)路径为 `https://www.example.com/sitemap.xml`。

如需查看更多示例，请参阅[语法]()部分。

### 创建 robots.txt 文件的基本准则

#### 创建 robots.txt 文件

您几乎可以使用任意文本编辑器创建 robots.txt 文件。例如，Notepad、TextEdit、vi 和 emacs 可用来创建有效的 robots.txt 文件。请勿使用文字处理软件，因为此类软件通常会将文件保存为专有格式，且可能会向文件中添加非预期的字符（如弯引号），这样可能会给抓取工具带来问题。如果保存文件时出现相应系统提示，请务必使用 UTF-8 编码保存文件。

格式和位置规则：
- 文件必须命名为 robots.txt。
- 网站只能有 1 个 robots.txt 文件。
- robots.txt 文件必须位于其要应用到的网站主机的根目录下。例如，若要控制对 `https://www.example.com/` 下所有网址的抓取，就必须将 robots.txt 文件放在 `https://www.example.com/robots.txt` 下，一定不能将其放在子目录中（例如 `https://example.com/pages/robots.txt` 下）。如果您不确定如何访问自己的网站根目录，或者需要相应权限才能访问，请与网站托管服务提供商联系。如果您无法访问网站根目录，请改用其他屏蔽方法（例如 [meta 标记](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=zh-cn)）。

- robots.txt 文件可以位于子网域（例如 `https://site.example.com/robots.txt`）或非标准端口（例如 `https://example.com:8181/robots.txt`）上。

- robots.txt 文件仅适用于所在的协议、主机和端口内的路径。也就是说，`https://example.com/robots.txt` 中的规则仅适用于 `https://example.com/` 中的文件，而不适用于子网域（如 `https://m.example.com/`）或备用协议（如 `http://example.com/`）。

- robots.txt 文件必须是采用 UTF-8 编码（包括 ASCII）的文本文件。Google 可能会忽略不属于 UTF-8 范围的字符，从而可能会导致 robots.txt 规则无效。

#### 如何编写 robots.txt 规则

规则是关于抓取工具可以抓取网站哪些部分的说明。向 robots.txt 文件中添加规则时，请遵循以下准则：

- robots.txt 文件由一个或多个组（一组规则）组成。

- 每个组由多条规则（也称为指令）组成，每条规则各占一行。每个组都以 User-agent 行开头，该行指定了组适用的目标。

- 每个组包含以下信息：
  - 组的适用对象（用户代理）
  - 代理可以访问的目录或文件。
  - 代理无法访问的目录或文件。

- 抓取工具会按从上到下的顺序处理组。一个用户代理只能匹配 1 个规则集（即与相应用户代理匹配的首个最具体组）。如果同一用户代理有多个组，这些组会在处理之前合并到一个组中。

- 系统的默认假设是：用户代理可以抓取所有未被 disallow 规则屏蔽的网页或目录。

- 规则区分大小写。例如，`disallow: /file.asp` 适用于 `https://www.example.com/file.asp`，但不适用于 `https://www.example.com/FILE.asp`。

- `#` 字符表示注释的开始处。在处理过程中，系统会忽略注释。

**Google 的抓取工具支持 robots.txt 文件中的以下规则：**
- `user-agent:` [必需，每个组需含一个或多个 User-agent 条目] 该规则指定了规则适用的自动客户端（即搜索引擎抓取工具）的名称。这是每个规则组的首行内容。[Google 用户代理列表](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers?hl=zh-cn)中列出了 Google 用户代理名称。使用星号 (`*`) 会匹配除各种 AdsBot 抓取工具之外的所有抓取工具，AdsBot 抓取工具必须明确指定。例如：
```txt
# Example 1: Block only Googlebot
User-agent: Googlebot
Disallow: /

# Example 2: Block Googlebot and Adsbot
User-agent: Googlebot
User-agent: AdsBot-Google
Disallow: /

# Example 3: Block all crawlers except AdsBot (AdsBot crawlers must be named explicitly)
User-agent: *
Disallow: /
```

- `disallow:` [每条规则需含至少一个或多个 `disallow` 或 `allow` 条目] 您不希望用户代理抓取的目录或网页（相对于根网域而言）。如果规则引用了某个网页，则必须提供浏览器中显示的完整网页名称。它必须以 `/` 字符开头；如果它引用了某个目录，则必须以 `/` 标记结尾。

- `allow:` [每条规则需含至少一个或多个 `disallow` 或 `allow` 条目] 上文中提到的用户代理可以抓取的目录或网页（相对于根网域而言）。此规则用于替换 `disallow` 规则，从而允许抓取已禁止访问的目录中的子目录或网页。对于单个网页，请指定浏览器中显示的完整网页名称。它必须以 `/` 字符开头；如果它引用了某个目录，则必须以 `/` 标记结尾。

- `sitemap:` [可选，每个文件可含零个或多个 `sitemap` 条目] 相应网站的站点地图的位置。站点地图网址必须是完全限定的网址；Google 不会假定存在或检查是否存在 http、https、www、非 www 网址变体。站点地图是一种用于指示 Google 应抓取哪些内容的理想方式，但并不用于指示 Google 可以抓取或不能抓取哪些内容。[详细了解站点地图](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview?hl=zh-cn)。 示例：
```txt
Sitemap: https://example.com/sitemap.xml
Sitemap: https://www.example.com/sitemap.xml
```
除 `sitemap` 之外的所有规则都支持使用通配符 `*` 表示路径前缀、后缀或整个字符串。

与这些规则均不匹配的行将被忽略。

如需有关每个规则的完整说明，请参阅 [Google 对 robots.txt 规范的解释](#google-如何解读-robotstxt-规范)页面。

#### 上传和测试

上传 robots.txt 文件后，要测试新上传的 robots.txt 文件是否可公开访问，请在浏览器中打开[无痕浏览窗口](https://support.google.com/chrome/answer/95464?hl=zh-cn)（或等效窗口），然后转到 robots.txt 文件的位置。例如 `https://example.com/robots.txt`。如果您看到 robots.txt 文件的内容，就可准备测试标记了。

## Google 如何解读 robots.txt 规范

Google 的自动[抓取工具](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers?hl=zh-cn)支持 [REP（robots 协议）](https://www.rfc-editor.org/rfc/rfc9309.html)。这意味着，在抓取某一网站之前，Google 抓取工具会下载并解析该网站的 robots.txt 文件，以提取关于网站中哪些部分可以被抓取的信息。REP 不适用于由用户控制的 Google 抓取工具（例如 Feed 订阅），也不适用于用来提高用户安全性的抓取工具（例如恶意软件分析）。

本页介绍了 Google 对 REP 的解读。有关原始标准的信息，请查看 [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)。

### 文件位置和有效范围

您必须将 robots.txt 文件放在网站的顶级目录中，并为其使用支持的协议。和其他网址一样，robots.txt 文件的网址也区分大小写。就 Google 搜索而言，支持的协议包括 HTTP、HTTPS 和 FTP。使用 HTTP 和 HTTPS 协议时，抓取工具会使用 HTTP 无条件 GET 请求来提取 robots.txt 文件；使用 FTP 时，抓取工具会使用标准 RETR (RETRIEVE) 命令，并采用匿名登录方式。

robots.txt 文件中列出的规则只适用于该文件所在的主机、协议和端口号。

下表列出了 robots.txt 网址及其适用的网址路径的示例。 第一列包含 robots.txt 文件的网址，第二列包含 robots.txt 文件将适用及不适用的网域。

**robots.txt 网址示例**
| robots.txt 网址 | 说明 |
| :--- | :--- |
| `https://example.com/robots.txt` | 这属于一般情况。该网址对其他子网域、协议或端口号来说无效。对同一个主机、协议和端口号上的所有子目录中的所有文件有效。 <br>✅适用于： <br>`https://example.com/` <br>`https://example.com/folder/file` <br>❌不适用于： <br>`https://other.example.com/` <br>`http://example.com/` <br>`https://example.com:8181/` |
| `https://www.example.com/robots.txt` | 子网域上的 robots.txt 仅对该子网域有效。 <br>✅适用于： <br>`https://www.example.com/` <br>❌不适用于： <br>`https://example.com/` <br>`https://shop.example.com/` <br>`https://www.example.com/`|
| `https://example.com/folder/robots.txt` | 不是有效的 robots.txt 文件。抓取工具不会检查子目录中的 robots.txt 文件。 |
| `https://www.example.com/robots.txt` | IDN 等同于其对应的 punycode 版本。另请参阅 [RFC 3492](https://www.ietf.org/rfc/rfc3492.txt)。 <br>✅适用于： <br>`https://www.example.com/robots.txt` <br>`https://xn--exmple-cua.com/` <br>❌不适用于：<br>`https://www.example.com/`|
| `ftp://example.com/robots.txt` | ✅适用于：<br>`ftp://example.com/robots.txt` <br>❌不适用于：<br>`https://example.com/` |
| `https://212.96.82.21/robots.txt` | 以 IP 地址作为主机名的 robots.txt 只在抓取作为主机名的该 IP 地址时有效。该 robots.txt 文件并不会自动对该 IP 地址上托管的所有网站有效，但该文件可能是共享的，在此情况下，它也可以在共享主机名下使用。✅适用于：<br>`https://212.96.82.21/` <br>❌不适用于：<br>`https://example.com/` 即使托管在 212.96.82.21 上） |
| `https://xample.com:443/robots.txt` | 标准端口号（HTTP 为 80，HTTPS 为 443，FTP 为 21）等同于其默认的主机名。<br>✅适用于：<br>`https://example.com:443/` <br>`https://example.com/` <br>❌不适用于：<br>`https://example.com:444/` |
| `https://example.com:8181/robots.txt` | 非标准端口号上的 robots.txt 文件只对通过这些端口号提供的内容有效。 <br>✅适用于：<br>` https://example.com:8181/` <br>❌不适用于：<br>`https://example.com/` |


### 错误处理和 HTTP 状态代码

在请求 robots.txt 文件时，服务器响应的 HTTP 状态代码会影响 Google 抓取工具使用 robots.txt 文件的方式。下表总结了 Googlebot 针对各种 HTTP 状态代码处理 robots.txt 文件的方式。

**错误处理和 HTTP 状态代码**
| HTTP 状态代码 | 描述 |
| :--- | :--- |
| 2xx (success) | 表示成功的 HTTP 状态代码会提示 Google 抓取工具处理服务器提供的 robots.txt 文件。 |
| 3xx (redirection) | Google 会按照 [RFC 1945](https://www.ietf.org/rfc/rfc1945.txt) 的规定跟踪至少五次重定向，然后便会停止，并将其作为 robots.txt 文件的 404 错误来处理。这也适用于重定向链中任何被禁止访问的网址，因为抓取工具会由于重定向而无法提取规则。<br><br>Google 不会跟踪 robots.txt 文件中的逻辑重定向（框架、JavaScript 或元刷新型重定向）。 |
| 4xx (client errors) | Google 抓取工具会将所有 4xx 错误（429 除外）解读为网站不存在有效的 robots.txt 文件，这意味着 Google 会假定没有任何抓取限制。 <br>**请勿使用 401 和 403 状态代码限制抓取速度。4xx 状态代码（429 除外）对抓取速度没有影响。 [了解如何限制抓取速度](https://developers.google.com/search/docs/crawling-indexing/reduce-crawl-rate?hl=zh-cn)。**|
| 5xx (server errors) | 如果 Google 找到了 robots.txt 文件，但无法提取该文件，则会遵循以下行为方式：<br>①在前 12 小时内，Google 会停止抓取相应网站，但会继续尝试提取 robots.txt 文件。<br>②如果 Google 无法提取新版本，那么在接下来的 30 天内，Google 将使用上一个正常版本，同时仍会尝试提取新版本。503 (service unavailable) 错误会导致非常频繁的重试操作。如果没有可用的缓存版本，Google 会假定没有任何抓取限制。<br>③如果在 30 天后错误仍未更正：<br>如果 Google 能够全面抓取相应网站，则会遵循没有 robots.txt 文件时的行为方式，但仍会继续检查是否有新版本。<br>如果 Google 无法全面抓取相应网站，则会停止抓取该网站，但仍会定期请求 robots.txt 文件。 |
| 其他错误 | 对于因 DNS 或网络问题（例如超时、响应无效、重置或断开连接、HTTP 组块错误等）而无法抓取的 robots.txt 文件，系统在处理时会将其视为[服务器错误。](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt?hl=zh-cn#server-error) |


### 缓存

Google 通常会将 robots.txt 文件的内容最多缓存 24 小时，但在无法刷新缓存版本的情况下（例如出现超时或 5xx 错误时），缓存时间可能会延长。已缓存的响应可由各种不同的抓取工具共享。 Google 会根据 [max-age Cache-Control](https://www.rfc-editor.org/rfc/rfc9110.html) HTTP 标头来延长或缩短缓存生命周期。

### 文件格式

robots.txt 文件必须是采用 UTF-8 编码的纯文本文件，且各行代码必须以 CR、CR/LF 或 LF 分隔。

Google 会忽略 robots.txt 文件中的无效行，包括 robots.txt 文件开头处的 Unicode 字节顺序标记 (BOM)，并且只使用有效行。例如，如果下载的内容是 HTML 格式而非 robots.txt 规则，Google 会尝试解析内容并提取规则，而忽略其他所有内容。

同样，如果 robots.txt 文件的字符编码不是 UTF-8，Google 可能会忽略不属于 UTF-8 范围的字符，从而可能会导致 robots.txt 规则无效。

Google 目前强制执行的 robots.txt 文件大小限制是 500 KiB，并忽略超过该上限的内容。您可以通过整合会导致 robots.txt 文件过大的规则来减小 robots.txt 文件的大小。例如，将已排除的内容放在一个单独的目录中。

### 语法

有效的 robots.txt 行由一个字段、一个冒号和一个值组成。可以选择是否使用空格，但建议使用空格，有助于提高可读性。系统会忽略行开头和结尾的空格。若要添加注释，请在注释前面加上 `#` 字符。请注意，`#` 字符后面的所有内容都会被忽略。常见格式为 `<field>:<value><#optional-comment>`。

Google 支持以下字段（不支持 `crawl-delay` 等其他字段）：
- `user-agent`：标识相应规则适用于哪些抓取工具。
- `allow`：可抓取的网址路径。
- `disallow`：不可抓取的网址路径。
- `sitemap`：站点地图的完整网址。

`allow` 和 `disallow` 字段也称为规则（即指令）。这些规则始终以 `rule: [path]` 的形式指定，其中 `[path]` 可以选择性使用。默认情况下，指定的抓取工具没有抓取限制。抓取工具会忽略不带 `[path]` 的规则。

如果指定了 `[path]` 值，该路径值就是 robots.txt 文件所在网站的根目录的相对路径（使用相同的协议、端口号、主机和域名）。路径值必须以 `/` 开头来表示根目录，该值区分大小写。详细了解[基于路径值的网址匹配](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt?hl=zh-cn#url-matching-based-on-path-values)。

#### user-agent

`user-agent` 行用来标识相应规则适用于哪些抓取工具。请参阅 Google 抓取工具和用户代理字符串，获取可在 robots.txt 文件中使用的用户代理字符串的完整列表。

`user-agent` 行的值不区分大小写。

#### disallow

`disallow` 规则用来指定不能被 `disallow` 规则所属的 `user-agent` 行所标识的抓取工具访问的路径。 抓取工具会忽略不含路径的规则。

Google 无法将禁止抓取的网页的内容编入索引，但可能仍会将其网址编入索引并将其显示在搜索结果中，但不显示摘要。了解如何[阻止编入索引](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=zh-cn)。

`disallow` 字段的值区分大小写。

用法：
```txt
disallow: [path]
```

#### allow

`allow` 规则用来指定相应抓取工具可以访问的路径。如果未指定路径，该规则将被忽略。

`allow` 字段的值区分大小写。

用法：
```txt
allow: [path]
```

#### sitemap

根据 [sitemaps.org](https://sitemaps.org/) 规定，Google、Bing 和其他主流搜索引擎支持 robots.txt 中的 `sitemap` 字段。

`sitemap` 字段的值区分大小写。

用法：
```txt
sitemap: [absoluteURL]
```

`[absoluteURL]` 行指向站点地图或站点地图索引文件的位置。 此网址必须是完全限定网址，包含协议和主机，且无需进行网址编码。此网址不需要与 robots.txt 文件位于同一主机上。您可以指定多个 `sitemap` 字段。`sitemap` 字段不依赖于任何特定的用户代理，只要未被禁止抓取，所有抓取工具都可以追踪它们。

例如：
```txt
user-agent: otherbot
disallow: /kale

sitemap: https://example.com/sitemap.xml
sitemap: https://cdn.example.org/other-sitemap.xml
sitemap: https://ja.example.org/テスト-サイトマップ.xml
```

### 行和规则分组

通过对每个抓取工具重复 `user-agent` 行，可将适用于多个用户代理的规则组合在一起。

例如：
```txt
user-agent: a
disallow: /c

user-agent: b
disallow: /d

user-agent: e
user-agent: f
disallow: /g

user-agent: h
```

此示例中有四个不同的规则组：

- 用户代理“a”为一组
- 用户代理“b”为一组
- 用户代理“e”和“f”为一组
- 用户代理“h”为一组

有关组的技术说明，请参阅 [REP 的第 2.1 节](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.1-2.4)。

### 用户代理的优先顺序

对于某个抓取工具而言，只有一个组是有效的。Google 抓取工具会在 robots.txt 文件中查找包含与抓取工具的用户代理相匹配的最具体用户代理的组，从而确定正确的规则组。其他组会被忽略。所有非匹配文本都会被忽略（例如，`googlebot/1.2` 和 `googlebot*` 均等同于 `googlebot`）。这与 robots.txt 文件中的组顺序无关。

如果为用户代理声明多个特定组，则这些组中适用于该特定用户代理的所有规则会在内部合并成一个组。特定于用户代理的组和全局组 (`*`) 不会合并。

#### 示例
user-agent 字段的匹配情况
```txt
user-agent: googlebot-news
(group 1)

user-agent: *
(group 2)

user-agent: googlebot
(group 3)
```

以下为抓取工具选择相关组的方法：
|  抓取工具 | 说明 |
| :--- | :--- |
| Googlebot News | googlebot-news 遵循组 1，因为组 1 是最具体的组。 |
| Googlebot（网络） | googlebot 遵循组 3。 |
| Googlebot Storebot | Storebot-Google 遵循组 2，因为没有具体的 Storebot-Google 组。 |
| Googlebot News（抓取图片时） | 抓取图片时，googlebot-news 遵循组 1。 googlebot-news 不会为 Google 图片抓取图片，因此它只遵循组 1。 |
| 其他机器人（网络） | 其他 Google 抓取工具遵循组 2。 |
| Otherbot（新闻） | 抓取新闻内容但未标识为 googlebot-news 的其他 Google 抓取工具遵循组 2。即使有相关抓取工具的对应条目，也只有在明确匹配时才会有效。 |

#### 规则分组

如果 robots.txt 文件中有多个组与特定用户代理相关，则 Google 抓取工具会在内部合并这些组。例如：
```txt
user-agent: googlebot-news
disallow: /fish

user-agent: *
disallow: /carrots

user-agent: googlebot-news
disallow: /shrimp
```

抓取工具会根据用户代理在内部对规则进行分组，例如：
```txt
user-agent: googlebot-news
disallow: /fish
disallow: /shrimp

user-agent: *
disallow: /carrots
```

`allow`、`disallow` 和 `user-agent` 以外的其他规则会被 robots.txt 解析器忽略。这意味着以下 robots.txt 代码段被视为一个组，因此 `user-agent` `a` 和 `b` 均受 `disallow: /` 规则的影响：
```txt
user-agent: a
sitemap: https://example.com/sitemap.xml

user-agent: b
disallow: /
```

当抓取工具处理 robots.txt 规则时，会忽略 `sitemap` 行。 例如，下面说明了抓取工具如何理解之前的 robots.txt 代码段：
```txt
user-agent: a
user-agent: b
disallow: /
```

### 基于路径值的网址匹配

Google 会以 `allow` 和 `disallow` 规则中的路径值为基础，确定某项规则是否适用于网站上的特定网址。为此，系统会将相应规则与抓取工具尝试抓取的网址的路径部分进行比较。路径中的非 7 位 ASCII 字符可以按照 [RFC 3986](https://www.ietf.org/rfc/rfc3986.txt) 作为 UTF-8 字符或百分号转义的 UTF-8 编码字符纳入。

对于路径值，Google、Bing 和其他主流搜索引擎支持有限形式的通配符。这些通配符包括：

- `*` 表示出现 0 次或多次的任何有效字符。
- `$` 表示网址结束。

下表显示了不同的通配符对解析的影响：
| 路径 | 匹配的地址 |
| :--- | :--- |
| `/` | 匹配根目录以及任何下级网址。 |
| `/*` | 等同于 `/`。结尾的通配符会被忽略。 |
| `/$` | 仅匹配根目录。任何更低级别的网址均可抓取。 |
| `/fish` | 匹配以 `/fish` 开头的任何路径。请注意，匹配时区分大小写。<br>✅匹配项：<br>`/fish` <br>`/fish.html` <br>`/fish/salmon.html` <br>`/fishheads` <br>`/fishheads/yummy.html` <br>`/fish.php?id=anything` <br>❌不匹配项：<br>`/Fish.asp` <br>`/catfish` <br>`/?id=fish` <br>`/desert/fish` |
| `/fish*` | 等同于 `/fish`。结尾的通配符会被忽略。<br>✅匹配项：<br>`/fish` <br>`/fish.html` <br>`/fish/salmon.html` <br>`/fishheads` <br>`/fishheads/yummy.html` <br>`/fish.php?id=anything` <br>❌不匹配项：<br>`/Fish.asp` <br>`/catfish` <br>`/?id=fish` <br>`/desert/fish` <br>❌不匹配项：<br>`/Fish.asp` <br>`/catfish` <br>`/?id=fish` <br>`/desert/fish` |
| `/fish/` | 匹配 `/fish/` 文件夹中的任何内容。<br>✅匹配项：<br>`/fish` <br>`/fish/?id=anything` <br>`/fish/salmon.html` <br>❌不匹配项：<br>`/fish` <br>`/fish.html` <br>`/animals/fish/` <br>`/Fish/Salmon.asp` |
| `/*.php` | 匹配包含 `.php` 的任何路径。<br>✅匹配项：<br>`/index.php` <br>`/filename.php` <br>`/folder/filename.php` <br>`/folder/filename.php?parameters` <br>`/folder/any.php.file.html` <br>`//filename.php/` <br>❌不匹配项：<br>`/`（即使其映射到 /index.php） <br>`/windows.PHP` |
| `/*.php$` | 匹配以 `.php` 结尾的任何路径<br>✅匹配项：<br>`/filename.php` <br>`/folder/filename.php` <br>❌不匹配项：<br>`/filename.php?parameters` <br>`/filename.php/` <br>`/filename.php5` <br>`/windows.PHP` |
| `/fish*.php` | 匹配包含 `/fish` 和 `.php`（按此顺序）的任何路径。<br>✅匹配项：<br>`/fish.php` <br>`/fishheads/catfish.php?parameters` <br>❌不匹配项：<br>`/Fish.PHP` |

### 规则的优先顺序

匹配 robots.txt 规则与网址时，抓取工具会根据规则路径的长度使用最具体的规则。如果规则（包括使用通配符的规则）存在冲突，Google 将使用限制性最弱的规则。

以下示例演示了 Google 抓取工具会对特定网址应用什么规则。

| 地址 | 匹配规则 |
| :--- | :--- |
| `http://www.example.com/` | `allow: /p` <br>`disallow: /` <br>适用规则：`allow: /p`，因为它更具体。 |
| `https://example.com/folder/page` | `allow: /folder` <br>`disallow: /folder` <br>适用规则：`allow: /folder`，因为规则存在冲突时，Google 会使用限制性最弱的规则。 |
| `https://example.com/page.htm` | `allow: /page` <br>`disallow: /*.htm` <br>适用规则：`disallow: /*.htm`，因为该规则路径更长，并且它与网址中的字符匹配得更多，因此更具体。 |
| `https://example.com/page.php5` | `allow: /page` <br>`disallow: /*.ph` <br>适用规则：`allow: /page`，因为规则存在冲突时，Google 会使用限制性最弱的规则。 |
| `https://example.com/` | `allow: /$` <br>`disallow: /` <br>适用规则：`allow: /$`，因为它更具体。 |
| `https://example.com/page.htm	` | `allow: /$` <br>`disallow: /` <br>适用规则：`allow: /p`，因为 allow 规则仅适用于根网址。 |

# 参考
[robots.txt](https://zh.wikipedia.org/wiki/Robots.txt)
[RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)
[stiemap](https://sitemaps.org/)
