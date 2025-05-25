---
lang: zh-CN
title: Idea
titleTemplate: 利用Raspberry Pi 4B推流
description: 利用Raspberry Pi 4B推流
head:
  - - meta
    - name: description
      content: 利用Raspberry Pi 4B推流
  - - meta
    - name: keywords
      content: Raspberry Pi 4B 推流 udp tcp rtmp
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
footer: true
---
# 利用Raspberry Pi 4B推流

基础环境：
| 硬件 | OS | 摄像头 |
| :--- | :--- | :--- |
| Raspberry Pi 4B | Raspberry Pi OS with desktop <br>Debian version: 12 (bookworm) <br>System: 64-bit <br>Kernel version: 6.12 | 摄像头模块 v2 |

前置条件：
ffmpeg和gstreamer安装完成，摄像头模块已正确安装
```bash
sudo apt update
sudo apt install rpicam-apps ffmpeg libgstreamer1.0-0 gstreamer1.0-tools \
gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly \
gstreamer1.0-libav
```

## 测试

测试摄像头是否正常
- 通过屏幕直接显示或VNC远程显示
  ```bash
  $ rpicam-hello
  ```
  相当于摄像头的 "hello world"，可启动摄像头预览流并显示在屏幕上。没有显示时，请检查摄像头是否正确安装。

- 通过SSH远程连接
  ```bash
  $ rpicam-still --output test.jpg
  ```
  拍照保存为 `test.jpg`，下载图片到本地，如果没有保存图片，请检查摄像头是否正确安装。

## 通过网络串流视频

### rpicam-apps推送UDP数据流

发送UDP数据流到目标主机：
```bash
$ rpicam-vid -t 0 -n --codec libav --libav-format mpegts -o udp://ip-addr:port
```
> [!NOTE]
> `ip-addr` 为目标主机的IP地址，`port` 为目标主机的端口号。注意目标主机需要防火墙允许从UDP端口入站。

接收UDP数据流：
```bash
ffplay udp://<ip-addr-of-server>:<port>
```
> [!TIP]
> 确保目标主机己安装了ffmpeg。

### rpicam-apps推送TCP数据流

发送TCP数据流到目标主机：
```bash
rpicam-vid -t 0 -n --codec libav --libav-format mpegts -o tcp://0.0.0.0:<port>?listen=1
```
> [!NOTE]
> `ip-addr` 为目标主机的IP地址，`port` 为目标主机的端口号。注意目标主机需要防火墙允许从TCP端口入站。

接收TCP数据流：
```bash
ffplay tcp://<ip-addr-of-server>:<port>
```

### GStreamer推送RTMP数据流

常用命令模块化

| 插件 | 功能 |
|------|------|
| `libcamerasrc` | Raspberry Pi 官方摄像头采集 |
| `v4l2src` | USB 摄像头采集 |
| `v4l2h264enc` | 硬件 H.264 编码器（低 CPU 占用）|
| `x264enc` | 软编码 H.264（兼容性强，CPU 占用高）|
| `h264parse` | 解析 H.264 流，用于封装 |
| `flvmux` | 将视频封装为 FLV 格式（RTMP 必须）|
| `rtmpsink` | 将 FLV 流推送到 RTMP 地址 |

查看摄像头设备路径：
```bash
$ v4l2-ctl --list-devices
bcm2835-codec-decode (platform:bcm2835-codec):
        /dev/video10
        /dev/video11
        /dev/video12
        /dev/video18
        /dev/video31

bcm2835-isp (platform:bcm2835-isp):
        /dev/video13
        /dev/video14
        /dev/video15
        /dev/video16
        /dev/video20
        /dev/video21
        /dev/video22
        /dev/video23
        /dev/media0
        /dev/media1

unicam (platform:fe801000.csi):
        /dev/video0
        /dev/media4

rpi-hevc-dec (platform:rpi-hevc-dec):
        /dev/video19
        /dev/media3

bcm2835-codec (vchiq:bcm2835-codec):
        /dev/media2
```

查看是否支持 `v4l2h264enc`
```bash
$ gst-inspect-1.0 | grep h264enc
openh264:  openh264enc: OpenH264 video encoder
video4linux2:  v4l2h264enc: V4L2 H.264 Encoder
```

验证RTMP地址是否可用：
```bash
gst-launch-1.0 videotestsrc ! \
video/x-raw,width=640,height=360,framerate=30/1,format=I420 ! \
x264enc bitrate=2048 speed-preset=ultrafast tune=zerolatency key-int-max=30 ! \
flvmux streamable=true ! \
rtmpsink location="rtmp://地址/串流码"
```
通过拉流或去对应的直播平台观看，验证是否正常推流

> [!NOTE]
> douyu的RTMP地址示例：`rtmp://sendhw3.douyu.com/live/9868420rVW1Dvrkg?dyPRI=0&origin=hw&record=flv&roirecognition=0&stemp_id=18888962&tw=0&wm=0&wsSecret=5c4ae64e85300a8ee2d5e5c9a7f44329&wsSeek=off&wsTime=683355c3`
> 一般串流码都有时间限制，所以需要定时更新串流码

#### 软编码推流

```bash
gst-launch-1.0 libcamerasrc ! \
video/x-raw,width=640,height=360,framerate=30/1,format=NV12 ! \
videoconvert ! \
x264enc bitrate=5000 speed-preset=ultrafast tune=zerolatency key-int-max=30 ! \
flvmux streamable=true ! \
rtmpsink location="rtmp://地址/串流码"
```

#### 硬编码推流

```bash
gst-launch-1.0 libcamerasrc ! \
capsfilter caps=video/x-raw,width=1920,height=1080,framerate=30/1,format=NV12,interlace-mode=progressive ! \
v4l2h264enc extra-controls="controls,video_bitrate=5000000,repeat_sequence_header=1" ! \
'video/x-h264,level=(string)4.2' ! \
h264parse ! \
flvmux streamable=true ! \
rtmpsink location="rtmp://地址/串流码"
```

#### 🚨 注意事项

1. **RTMP 地址要用双引号包裹**，防止 shell 把 `&` 解析成后台运行符：

   ```bash
   location="rtmp://sendhw3.douyu.com/live/your_stream_key?wsSecret=xxx&..."
   ```

2. 如果你遇到如下错误：

   ```
   no parser available for codec h264
   ```

   请确保你安装了：

   ```bash
   sudo apt install gstreamer1.0-plugins-bad
   ```

3. 如果你遇到硬编码器不支持某些参数，可以运行：

   ```bash
   gst-inspect-1.0 v4l2h264enc
   ```

   查看所支持的参数（如 `bitrate`、`repeat_sequence_header`）

## 参考资料

[Camera software](https://www.raspberrypi.com/documentation/computers/camera_software.html)
[摄像头软件](https://pidoc.cn/docs/computers/camera-software)
