---
lang: zh-CN
title: Idea
titleTemplate: proxy
description: proxy
head:
  - - meta
    - name: description
      content: proxy
  - - meta
    - name: keywords
      content: vlessenc vision xhttp reality
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# 代理配置 `vlessenc vision xhttp reality`

## 服务端配置

下面是服务端配置文件示例。

::: code-group

```json [config.json]
{

  "version": {
    "min": "26.2.6",
    "max": ""
  },

  "log": {
    "access": "/var/log/Xray/access.log",
    "error": "/var/log/Xray/error.log",
    "loglevel": "debug",
    "dnsLog": false,
    "maskAddress": "full"
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "ip": ["geoip:private"],
        "outboundTag": "blocked",
        "ruleTag": "lan_ip"
      },
      {
        "domain": ["geosite:category-ads-all", "geosite:cn"],
        "outboundTag": "blocked",
        "ruleTag": "block_cn_domain"
      },
      {
        "ip": ["223.5.5.5", "223.6.6.6", "2400:3200::1", "2400:3200:baba::1", "119.29.29.29", "1.12.12.12", "120.53.53.53", "2402:4e00::", "2402:4e00:1::", "180.76.76.76", "2400:da00::6666", "114.114.114.114", "114.114.115.115", "114.114.114.119", "114.114.115.119", "114.114.114.110", "180.184.1.1", "180.184.2.2", "101.226.4.6", "218.30.118.6", "123.125.81.6", "140.207.198.6", "1.2.4.8", "210.2.4.8", "52.80.66.66", "117.50.22.22", "2400:7fc0:849e:200::4", "2404:c2c0:85d8:901::4", "117.50.10.10", "52.80.52.52", "2400:7fc0:849e:200::8", "2404:c2c0:85d8:901::8", "117.50.60.30", "52.80.60.30"],
        "outboundTag": "blocked",
        "ruleTag": "block_cn_dns_ip"
      },
      {
        "domain": ["alidns.com", "doh.pub", "dot.pub", "360.cn", "onedns.net"],
        "outboundTag": "blocked",
        "ruleTag": "block_cn_dns_domain"
      },
      {
        "inboundTag": ["vless_proxy"],
        "protocol": ["bittorrent"],
        "outboundTag": "blocked",
        "ruleTag": "block_bittorrent"
      },
      {
        "domain": ["googleapis.cn", "gstatic.com", "api.ip.sb"],
        "network": "tcp,udp",
        "inboundTag": ["vless_proxy"],
        "protocol": ["http", "tls", "quic"],
        "outboundTag": "direct",
        "ruleTag": "proxy_google_site"
      },
      {
        "ip": ["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001", "1.1.1.2", "1.0.0.2", "2606:4700:4700::1112", "2606:4700:4700::1002", "1.1.1.3", "1.0.0.3", "2606:4700:4700::1113", "2606:4700:4700::1003", "8.8.8.8", "8.8.4.4", "2001:4860:4860::8888", "2001:4860:4860::8844", "94.140.14.14", "94.140.15.15", "2a10:50c0::ad1:ff", "2a10:50c0::ad2:ff", "94.140.14.15", "94.140.15.16", "2a10:50c0::bad1:ff", "2a10:50c0::bad2:ff", "94.140.14.140", "94.140.14.141", "2a10:50c0::1:ff", "2a10:50c0::2:ff", "208.67.222.222", "208.67.220.220", "2620:119:35::35", "2620:119:53::53", "208.67.222.123", "208.67.220.123", "2620:119:35::123", "2620:119:53::123", "9.9.9.9", "149.112.112.112", "2620:fe::9", "2620:fe::fe", "9.9.9.11", "149.112.112.11", "2620:fe::11", "2620:fe::fe:11", "9.9.9.10", "149.112.112.10", "2620:fe::10", "77.88.8.8", "77.88.8.1", "2a02:6b8::feed:0ff", "2a02:6b8:0:1::feed:0ff", "77.88.8.88", "77.88.8.2", "2a02:6b8::feed:bad", "2a02:6b8:0:1::feed:bad", "77.88.8.7", "77.88.8.3", "2a02:6b8::feed:a11", "2a02:6b8:0:1::feed:a11"],
        "network": "tcp,udp",
        "inboundTag": ["vless_proxy"],
        "protocol": ["http", "tls", "quic"],
        "outboundTag": "direct",
        "ruleTag": "proxy_dns_ip"
      },
      {
        "domain": ["cloudflare-dns.com", "one.one.one.one", "dns.google", "adguard-dns.com", "opendns.com", "umbrella.com", "quad9.net", "yandex.net"],
        "network": "tcp,udp",
        "inboundTag": ["vless_proxy"],
        "protocol": ["http", "tls", "quic"],
        "outboundTag": "direct",
        "ruleTag": "proxy_dns_domain"
      },
      {
        "domain": ["geosite:gfw", "geosite:greatfire"],
        "network": "tcp,udp",
        "inboundTag": ["vless_proxy"],
        "protocol": ["http", "tls", "quic"],
        "outboundTag": "direct",
        "ruleTag": "proxy_gfw_domain"
      },
      {
        "ip": ["geoip:facebook", "geoip:fastly", "geoip:google", "geoip:netflix", "geoip:telegram", "geoip:twitter", "geoip:!cn"],
        "network": "tcp,udp",
        "inboundTag": ["vless_proxy"],
        "protocol": ["http", "tls", "quic"],
        "outboundTag": "direct",
        "ruleTag": "proxy_not_cn_ip"
      }
    ]
  },
  "policy": {
    "levels": {
      "0": {
        "handshake": 4,
        "connIdle": 300,
        "uplinkOnly": 2,
        "downlinkOnly": 5,
        "statsUserUplink": false,
        "statsUserDownlink": false,
        "statsUserOnline": false,
        "bufferSize": 128
      }
    },
    "system": {
      "statsInboundUplink": false,
      "statsInboundDownlink": false,
      "statsOutboundUplink": false,
      "statsOutboundDownlink": false
    }
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": 80,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "todo1",
            "level": 0,
            "email": "love@xray.com",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "todo2"
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "target": "todo3",
          "serverNames": [
            "todo4",
            "todo4"
          ],
          "privateKey": "todo5",
          "minClientVer": "26.2.6",
          "shortIds": ["todo6", "todo6"],
          "mldsa65Seed": "todo7",
          "limitFallbackUpload": {
            "afterBytes": 0,
            "bytesPerSec": 0,
            "burstBytesPerSec": 0
          },
          "limitFallbackDownload": {
            "afterBytes": 0,
            "bytesPerSec": 0,
            "burstBytesPerSec": 0
          }
        },
        "xhttpSettings": {
          "path": "todo8",
          "mode": "auto"
        },
        "sockopt": {
          "mark": 0,
          "tcpMaxSeg": 1440,
          "tcpFastOpen": false,
          "tproxy": "off",
          "domainStrategy": "AsIs",
          "happyEyeballs": {},
          "dialerProxy": "",
          "acceptProxyProtocol": false,
          "tcpKeepAliveInterval": 0,
          "tcpKeepAliveIdle": 300,
          "tcpUserTimeout": 10000,
          "v6only": false,
          "tcpWindowClamp": 600,
          "tcpMptcp": false
        }
      },
      "tag": "vless_proxy",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"],
        "metadataOnly": false,
        "routeOnly": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "AsIs",
        "userLevel": 0,
        "fragment": {
          "packets": "tlshello",
          "length": "100-200",
          "interval": "10-20"
        },
        "proxyProtocol": 0
      },
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "settings": {
        "reponse": {
          "type": "none"
        }
      },
      
      "tag": "blocked"
    }
  ]
}
```

:::

target最好选择一些你服务所在地区的大学的域名。

测试脚本

```bash
$ curl -w "DNS解析时间 (time_namelookup): %{time_namelookup}s\nTCP连接时间 (time_connect): %{time_connect}s\nSSL/TLS握手完成 (time_appconnect): %{time_appconnect}s\n准备传输时间 (time_pretransfer): %{time_pretransfer}s\n首字节到达 (time_starttransfer): %{time_starttransfer}s\n总共耗时 (time_total): %{time_total}s\n" -o /dev/null -s -v https://www.lafilm.edu 2>&1 | grep -iE "(SSL connection|ALPN|time_[a-z]+|< server:|< cf-)"
```

输出结果示例1：

```text
* ALPN: curl offers h2,http/1.1
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / id-ecPublicKey
* ALPN: server accepted h2
< cf-ray: 9d76b71c3b4fd183-LAX
< cf-cache-status: HIT
< server: cloudflare
DNS解析时间 (time_namelookup): 0.010424s
TCP连接时间 (time_connect): 0.012038s
SSL/TLS握手完成 (time_appconnect): 0.079248s
准备传输时间 (time_pretransfer): 0.079651s
首字节到达 (time_starttransfer): 0.099113s
总共耗时 (time_total): 0.127036s
```

要上面的结果，server: cloudflare，说明该服务使用了Cloudflare。最好不要选择这中。

输出结果示例2：

```text
n" -o /dev/null -s -v https://www.ucla.edu 2>&1 | grep -iE "(SSL connection|ALPN|time_[a-z]+|< server:|< cf-)"
* ALPN: curl offers h2,http/1.1
* SSL connection using TLSv1.3 / TLS_AES_128_GCM_SHA256 / X25519 / RSASSA-PSS
* ALPN: server accepted h2
< server: Apache/2.4.66 () PHP/7.2.34
DNS解析时间 (time_namelookup): 0.008179s
TCP连接时间 (time_connect): 0.009324s
SSL/TLS握手完成 (time_appconnect): 0.068099s
准备传输时间 (time_pretransfer): 0.068695s
首字节到达 (time_starttransfer): 0.073885s
总共耗时 (time_total): 0.087795s
```

这种服务没有使用Cloudflare，选择这种比较适合。

也有其他选择参考：[美西目标域名推荐](https://github.com/XTLS/Xray-core/discussions/2256)

> [!TIP]
>
> todo1: 使用 `./xray uuid` 命令生成一个UUID，将生成的UUID替换todo1。
>
> todo2: 使用 `./xray vlessenc` 命令生成一个VLESS 密钥对，将 `decryption` 对应的值替换todo5。注意保存 `encryption` 对应的值，后面客户端配置会用到。
>
> todo3: 填入你的VLESS 伪装域名，比如 `apple.com:443`。
>
> todo4: 客户端可用的 serverName 列表，不支持 * 通配符。一般与 target 保持一致即可，实际的可选值为服务器所接受的任何 SNI（依据 target 本身的配置有所不同），一般是参考是所返回证书的 [SAN](https://zh.wikipedia.org/wiki/%E4%B8%BB%E9%A2%98%E5%A4%87%E7%94%A8%E5%90%8D%E7%A7%B0)。
>
> todo5: 使用 `./xray x25519` 生成一个X25519密钥对，将生成的密钥对中的 `PrivateKey` 替换todo5。注意保存 `Password` 对应的值，后面客户端配置会用到。
>
> todo6: 长度为 8 个字节，即 16 个 0~f 的数字字母，可以小于16个，核心将会自动在后面补0, 但位数必须是偶数 (因为一个字节有2位16进制数)。
>
> todo7: 使用 `./xray mldsa65` 生成一个MLDSA65密钥对，将生成的密钥对中的 `Seed` 替换todo7。注意保存 `Verify` 对应的值，后面客户端配置会用到。
>
> todo8: 填入你的VLESS 伪装路径，可以填入使用 `./xray uuid` 生成的UUID。

## 客户端配置

客户端配置文件示例：

::: code-group

```json [config.json]
{
  "log": {
    "loglevel": "warning"
  },
  "dns": {
    "hosts": {
      "dns.google": [
        "8.8.8.8",
        "8.8.4.4",
        "2001:4860:4860::8888",
        "2001:4860:4860::8844"
      ],
      "dns.alidns.com": [
        "223.5.5.5",
        "223.6.6.6",
        "2400:3200::1",
        "2400:3200:baba::1"
      ],
      "one.one.one.one": [
        "1.1.1.1",
        "1.0.0.1",
        "2606:4700:4700::1111",
        "2606:4700:4700::1001"
      ],
      "1dot1dot1dot1.cloudflare-dns.com": [
        "1.1.1.1",
        "1.0.0.1",
        "2606:4700:4700::1111",
        "2606:4700:4700::1001"
      ],
      "cloudflare-dns.com": [
        "104.16.249.249",
        "104.16.248.249",
        "2606:4700::6810:f8f9",
        "2606:4700::6810:f9f9"
      ],
      "dns.cloudflare.com": [
        "104.16.132.229",
        "104.16.133.229",
        "2606:4700::6810:84e5",
        "2606:4700::6810:85e5"
      ],
      "dot.pub": [
        "1.12.12.12",
        "120.53.53.53"
      ],
      "doh.pub": [
        "1.12.12.12",
        "120.53.53.53"
      ],
      "dns.quad9.net": [
        "9.9.9.9",
        "149.112.112.112",
        "2620:fe::fe",
        "2620:fe::9"
      ],
      "dns.yandex.net": [
        "77.88.8.8",
        "77.88.8.1",
        "2a02:6b8::feed:0ff",
        "2a02:6b8:0:1::feed:0ff"
      ],
      "dns.sb": [
        "185.222.222.222",
        "2a09::"
      ],
      "dns.umbrella.com": [
        "208.67.220.220",
        "208.67.222.222",
        "2620:119:35::35",
        "2620:119:53::53"
      ],
      "dns.sse.cisco.com": [
        "208.67.220.220",
        "208.67.222.222",
        "2620:119:35::35",
        "2620:119:53::53"
      ],
      "engage.cloudflareclient.com": [
        "162.159.192.1"
      ]
    },
    "servers": [
      {
        "address": "https://dns.alidns.com/dns-query",
        "domains": [
          "domain:alidns.com",
          "domain:doh.pub",
          "domain:dot.pub",
          "domain:360.cn",
          "domain:onedns.net",
          "todo9"
        ],
        "skipFallback": true
      },
      {
        "address": "https://cloudflare-dns.com/dns-query",
        "domains": [
          "geosite:google"
        ],
        "skipFallback": true
      },
      {
        "address": "https://dns.alidns.com/dns-query",
        "domains": [
          "geosite:private",
          "geosite:cn"
        ],
        "skipFallback": true
      },
      {
        "address": "223.5.5.5",
        "domains": [
          "full:dns.alidns.com",
          "full:cloudflare-dns.com"
        ],
        "skipFallback": true
      },
      "https://cloudflare-dns.com/dns-query"
    ]
  },
  "inbounds": [
    {
      "tag": "socks",
      "port": 10808,
      "listen": "127.0.0.1",
      "protocol": "mixed",
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ],
        "routeOnly": false
      },
      "settings": {
        "auth": "noauth",
        "udp": true,
        "allowTransparent": false
      }
    }
  ],
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "todo10",
            "port": todo11,
            "users": [
              {
                "id": "todo12",
                "email": "t@t.tt",
                "security": "auto",
                "encryption": "todo13",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "reality",
        "xhttpSettings": {
          "path": "todo14",
          "mode": "auto"
        },
        "realitySettings": {
          "serverName": "todo15",
          "fingerprint": "chrome",
          "show": false,
          "password": "todo16",
          "shortId": "todo17",
          "spiderX": "",
          "mldsa65Verify": "todo18"
        }
      },
      "mux": {
        "enabled": false,
        "concurrency": -1
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "block",
      "protocol": "blackhole"
    }
  ],
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [
      {
        "type": "field",
        "inboundTag": [
          "api"
        ],
        "outboundTag": "api"
      },
      {
        "type": "field",
        "port": "443",
        "network": "udp",
        "outboundTag": "block"
      },
      {
        "type": "field",
        "outboundTag": "proxy",
        "domain": [
          "geosite:google"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:private"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
          "geosite:private"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "223.5.5.5",
          "223.6.6.6",
          "2400:3200::1",
          "2400:3200:baba::1",
          "119.29.29.29",
          "1.12.12.12",
          "120.53.53.53",
          "2402:4e00::",
          "2402:4e00:1::",
          "180.76.76.76",
          "2400:da00::6666",
          "114.114.114.114",
          "114.114.115.115",
          "114.114.114.119",
          "114.114.115.119",
          "114.114.114.110",
          "114.114.115.110",
          "180.184.1.1",
          "180.184.2.2",
          "101.226.4.6",
          "218.30.118.6",
          "123.125.81.6",
          "140.207.198.6",
          "1.2.4.8",
          "210.2.4.8",
          "52.80.66.66",
          "117.50.22.22",
          "2400:7fc0:849e:200::4",
          "2404:c2c0:85d8:901::4",
          "117.50.10.10",
          "52.80.52.52",
          "2400:7fc0:849e:200::8",
          "2404:c2c0:85d8:901::8",
          "117.50.60.30",
          "52.80.60.30"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
          "domain:alidns.com",
          "domain:doh.pub",
          "domain:dot.pub",
          "domain:360.cn",
          "domain:onedns.net"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:cn"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
          "geosite:cn"
        ]
      }
    ]
  }
}
```

:::

> [!TIP]
>
> todo9 你的服务器域名地址。
>
> todo10 你的服务器域名地址。
>
> todo11 你的服务器端口，数值类型。
>
> todo12 和服务器配置中的todo1保持一致。
>
> todo13 服务器配置中的todo2对应的 `encryption` 的值。
>
> todo14 和服务器配置中的todo8保持一致。
>
> todo15 从服务器配置中的todo4对应的的值中任选一个填入。
>
> todo16 服务器配置中的todo5对应的 `Password` 的值。
>
> todo17 从服务器配置中的todo6对应的的值中任选一个填入。
>
> todo18 服务器配置中的todo7对应的 `Verify` 的值。

```bash
dpkg --print-architecture | xargs -I {} wget -q https://github.com/badafans/warp-reg/releases/download/v1.0/main-linux-{} -O warp-reg && chmod +x warp-reg && ./warp-reg
```

## 参考链接

[Xray](https://xtls.github.io/)