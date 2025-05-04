---
lang: zh-CN
title: Jetson
titleTemplate: Jetson TX2配置VNC
description: Jetson TX2配置VNC
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: jetson TX2 VNC SEO
layout: doc
navbar: true
sidebar: true
aside: true
outline: deep
lastUpdated: Date
editLink: false
footer: true
---
# Jetson TX2配置VNC

## 找到Jetpack自带说明文档

刷完系统后，使用 `ssh` 连接TX2，进入系统找到README-vnc.txt，并输出其中内容：
```sh
$ cat /media/tx2/L4T-README/README-vnc.txt
```

输出内容如下：
```text {28-29,41-42,46-47,52-53,57,98-106} [README-vnc.txt]
=======================================================================
                            README-vnc
                          Linux for Tegra
               Configuring VNC from the command-line
=======================================================================


A VNC server allows access to the graphical display of a Linux for Tegra system
over the network. This allows you to work physically remote from the Linux for
Tegra system, and avoids the need to connect an HDMI display, USB keyboard, or
mouse.


All commands specified below should be executed from a terminal on the Linux
for Tegra system. This could be a serial port, an SSH session, or a graphical
terminal application running on the HDMI display.


----------------------------------------------------------------------
Installing the VNC Server
----------------------------------------------------------------------


It is expected that the VNC server software is pre-installed. Execute the
following commands to ensure that it is:


sudo apt update
sudo apt install vino


----------------------------------------------------------------------
Enabling the VNC Server
----------------------------------------------------------------------


Execute the following commands to enable the VNC server:


# Enable the VNC server to start each time you log in
mkdir -p ~/.config/autostart
cp /usr/share/applications/vino-server.desktop ~/.config/autostart


# Configure the VNC server
gsettings set org.gnome.Vino prompt-enabled false
gsettings set org.gnome.Vino require-encryption false


# Set a password to access the VNC server
# Replace thepassword with your desired password
gsettings set org.gnome.Vino authentication-methods "['vnc']"
gsettings set org.gnome.Vino vnc-password $(echo -n 'thepassword'|base64)
# thepassword需要改为自己想要设置的密码 // [!code warning]

# Reboot the system so that the settings take effect
sudo reboot


The VNC server is only available after you have logged in to Jetson locally. If
you wish VNC to be available automatically, use the system settings application
to enable automatic login.


----------------------------------------------------------------------
Connecting to the VNC server
----------------------------------------------------------------------


Use any standard VNC client application to connect to the VNC server that is
running on Linux for Tegra. Popular examples for Linux are gvncviewer and
remmina. Use your own favorite client for Windows or MacOS.


To connect, you will need to know the IP address of the Linux for Tegra system.
Execute the following command to determine the IP address:


ifconfig


Search the output for the text "inet addr:" followed by a sequence of four
numbers, for the relevant network interface (e.g. eth0 for wired Ethernet,
wlan0 for WiFi, or l4tbr0 for the USB device mode Ethernet connection).


----------------------------------------------------------------------
Setting the Desktop Resolution
----------------------------------------------------------------------


The desktop resolution is typically determined by the capabilities of the
display that is attached to Jetson. If no display is attached, a default
resolution of 640x480 is selected. To use a different resolution, edit
/etc/X11/xorg.conf and append the following lines:
# 编辑/etc/X11/xorg.conf,在最后面添加下方内容可以设置分辨率 // [!code warning]

Section "Screen"
   Identifier    "Default Screen"
   Monitor       "Configured Monitor"
   Device        "Tegra0"
   SubSection "Display"
       Depth    24
       Virtual 1280 800 # Modify the resolution by editing these values
   EndSubSection
EndSection
```

跟据README-vnc.txt中的说明和上面高亮显示的内容，进行配置。

## 配置自动登录

完成上面步骤还需要设置自动登录，才能用vnc客户端连接上。具体方法见[Jetson TX2设置自动登录](Jetson%20TX2设置自动登录.md)。
