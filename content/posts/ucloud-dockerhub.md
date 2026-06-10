---
title: 香港VPS拉不动 Docker Hub，我真服了
date: 2026-05-22
summary: 每次 docker pull 都像抽奖，有时候能拉下来，有时候挂代理都不行。记录一下这个让人血压升高的破事。
tags: [技术, 运维, 服务器, 吐槽]
---

## 买个服务器也能踩坑

为了上线博客，搞点小玩意，买了个云服务器。国内的都要备案——我一个个人博客，备什么案？备案要等两周，还要填各种材料，这种好政策还是留给别人享受吧。

搁网上千挑万选，看到了了ucloud家的，倒不是因为他家服务好质量优，只是对囊中略显羞涩的人来说，预算的考量总是蛮靠前的。不过116块拿下2c4g一年的香港机器确实香爆了。

然后就开始被教做人。

## Docker Hub 的玄学连接

博客用的是 Docker Compose 部署，四五个容器。每次改完代码要构建镜像，就得 `docker build`。

问题来了——Dockerfile 里第一行往往是个基础镜像：

```dockerfile
FROM node:24-alpine
```

就这里，不管是在WSL上还是香港VPS上都得卡十分钟。**压根连不上**。

```
ERROR: failed to do request: Head "https://registry-1.docker.io/v2/library/node/manifests/24-alpine":
dial tcp 174.37.154.236:443: i/o timeout
```

不仅仅是 node，nginx:alpine、maven:3.9-eclipse-temurin-17、eclipse-temurin:17-jre 全部超时。单独试 docker pull 也一样：

```
Error response from daemon: failed to resolve reference "docker.io/library/nginx:alpine":
dial tcp 202.160.128.40:443: i/o timeout
```

一开始以为是偶发的。重试一下就好。后面试的多了发现确实是偶发——偶的太多了——每天晚上七八点开始，Docker Hub 基本就废了。白天有时候能拉下来，看运气，晚上几乎是拉不下的。

## 排查过程（让人崩溃的部分）

第一步：确认不是服务器断网

```bash
# 试试国内站点
curl https://www.baidu.com
# 200 OK，国内正常

# 试试国外站点
curl https://www.google.com
# 000 timeout，国外全炸

# 试试 Docker Hub
curl https://registry-1.docker.io
# 也超时
```

第二步：确认不是 DNS 污染

域名能正常解析，返回了不同的 CDN IP（174.37.154.236、202.160.128.40、199.59.150.12），但 TCP 连接建立不了。说明是防火墙层面的阻断，不是 DNS 劫持。

第三步：测试 Docker 镜像加速器

```bash
curl https://registry.cn-hangzhou.aliyuncs.com  → 200 OK   # 阿里云 ✅
curl https://mirror.ccs.tencentyun.com           → 000      # 腾讯云 ❌
curl https://docker.mirrors.ustc.edu.cn          → 000      # 中科大 ❌
```

只有阿里云杭州的镜像服务可达。中科大后来看了官网似乎是停掉了。

于是去 UCloud 控制台看了一下带宽和流量——一切正常。他们家下单后还会邮箱发你客服经理的微信号，但他又甩给我其他客服的链接，回复说：「国际链路的波动属于正常现象，香港高峰期拥堵，建议您使用其他时间段进行镜像拉取」。

> 其他时间段？我看这价格是在网络配置上抠出来的


## 为什么会这样

香港服务器，不等于能访问国际互联网(确实是回归怀抱了)。 registry-1.docker.io 的 CDN 节点 IP 池里，部分 IP 被墙或不稳定。每次 DNS 解析随机分配一个 IP：

| 尝试 | 解析到的IP | 结果 |
|------|---------|---------|
| 第 1 次 | 174.37.154.236 | timeout |
| 第 2 次 | 202.160.128.40 | timeout |
| 第 3 次 | 199.59.150.12 | timeout |
| 第 4 次 | 202.160.129.37 | timeout |
| 第 n 次 | 谁知道呢（运气好） | √ |

## 最后的方案

短效方案：反复重试，赌 DNS 分配到可通的 IP。

长效方案：配置 Docker daemon 使用阿里云镜像加速器 /etc/docker/daemon.json：

```bash
{
  "registry-mirrors": ["https://registry.cn-hangzhou.aliyuncs.com"]
}
```

然后 `sudo systemctl restart docker`。

## 总结（吐槽版）

有时候做个人项目最累的不是写代码，是这种基础设施的破事，实际上你天天在 debug 网络链路。

香港 ≠ 国际线路：很多人默认香港服务器访问外网无障碍，实际上部分国际网站（包括 Docker Hub CDN）一样被限
Docker Hub 的 CDN 策略：registry-1.docker.io 背后是一个巨大的 IP 池，不同地区 DNS 解析到的节点不同，稳定性也参差不齐
重试也是策略：有时候真的就是"我就不信了"就能通，但这不是解决方案，只是应急手段