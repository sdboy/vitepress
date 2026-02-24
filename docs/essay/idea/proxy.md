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
# 代理配置


`/etc/xray/config.json`

::: code-group

```jsonc [config.json]
{

  "version": {
    "min": "26.2.6",
    "max": ""
  },

  "log": {
    "access": "/var/log/Xray/access.log",
    "error": "/var/log/Xray/error.log",
    "loglevel": "error"
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
      },
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
  // todo
  "inbounds": [
    {
      "listen": "::",
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
            "level": 0,
            "email": "love@xray.com",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none",
        "fallbacks": [
          {
            "name": "http://backend",
            "dest": 8080,
            "xver": 1
          }
        ]
      },
      "streamSettings": {
        "network": "xhttp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "target": "example.com:443",
          "serverNames": ["example.com", "www.example.com"],
          "privateKey": "",
          "minClientVer": "26.2.6",
          "shortIds": ["", "0123456789abcdef"],
          "mldsa65Seed": "",
          "limitFallbackUpload": {
            "afterBytes": 0,
            "bytesPerSec": 0,
            "burstBytesPerSec": 0
          },
          "limitFallbackDownload": {
            "afterBytes": 0,
            "bytesPerSec": 0,
            "burstBytesPerSec": 0
          },
          "fingerprint": "chrome",
          "serverName": "",
          "password": "",
          "shortId": "",
          "mldsa65Verify": "",
          "spiderX": ""
        },
        "xhttpSettings": {
          "host": "example.com",
          "path": "/yourpath", // must be the same
          "mode": "auto",
          "extra": {
            "headers": {
                // "key": "value"
            },
            "xPaddingBytes": "100-1000",
            "noSSEHeader": false,
            "scMaxEachPostBytes": 1000000,
            "scMaxBufferedPosts": 30,
            "scStreamUpServerSecs": "20-80"
          }
        }
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
          "tcpCongestion": "bbr",
          "interface": "wg0",
          "v6only": false,
          "tcpWindowClamp": 600,
          "tcpMptcp": false
        }
      },
      "tag": "标识",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"],
        "metadataOnly": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "blackhole",
      "settings": {
        "reponse": {
          "type": "none"
        }
      },
      
      "tag": "blocked"
    },
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
    }
  ]
}
```

:::

```bash
dpkg --print-architecture | xargs -I {} wget -q https://github.com/badafans/warp-reg/releases/download/v1.0/main-linux-{} -O warp-reg && chmod +x warp-reg && ./warp-reg
```