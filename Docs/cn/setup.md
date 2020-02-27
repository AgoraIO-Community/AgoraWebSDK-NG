---
id: setup
title: 准备并集成 SDK
sidebar_label: 集成 SDK
---

## 前提条件
在使用 Agora Web SDK NG 之前，你需要:
- [注册](https://sso.agora.io/cn/signup?_ga=2.63500074.482805615.1577072824-849535803.1560925029) 一个有效的 Agora 账号
- 在 [控制台](https://console.agora.io/) 页面创建一个项目，鉴权机制选择 `APP ID`。（或者直接使用一个已有项目）
> 这里为了之后代码叙述和开发便利，我们默认使用 `APP ID` 完成鉴权，也就是只需在 SDK 设置好 `APP ID` 即可完成鉴权。如果您打算将项目上线，请在之后的开发过程中将其设置成安全性更高的 `APP ID + APP 证书 + Token`。
- 摄像头和麦克风设备

> 如果你的网络环境部署了防火墙，请根据[应用企业防火墙限制](https://docs.agora.io/cn/Agora%20Platform/firewall?platform=All%20Platforms)打开相关端口。

## 集成 SDK
选择如下任意一种方法获取 Agora Web SDK NG：

### 方法 1. 使用 npm 获取 SDK
使用该方法需要先安装 npm，详见 [npm 快速入门](https://www.npmjs.com.cn/getting-started/installing-node/)。

1. 运行安装命令
```shell
npm install agora-rtc-sdk-ng
```

2. 在你的项目的 Javascript 引入这个模块：
```js
import AgoraRTC from "agora-rtc-sdk-ng"

const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
```

如果您使用 `Typescript`, 还可以引入 SDK 中的类型对象
```typescript
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng"

const client: IAgoraRTCClient = createClient({ mode: "live", codec: "vp8" });
```

### 方法 2. 使用 CDN 方法获取 SDK
该方法无需下载安装包。在项目文件中，将以下代码添加到 `<style>` 上一行：

```html
<script src="https://cdn.agora.io/sdk/release/AgoraRTCSDK-3.0.0.js"></script>
```

### 方法 3. 手动下载 SDK
1. 下载最新版 Agora Web SDK 软件包。

2. 将下载下来的软件包中的 AgoraRTCSDK_N.js 文件保存到项目文件所在的目录下。

3. 在项目文件中，将如下代码添加到 `<style>` 上一行：

```html
<script src="./AgoraRTCSDK_N.js"></script>
```

> 在方法 2 和方法 3 中，SDK 都会在全局导出一个 `AgoraRTC` 对象，直接访问这个对象即可操作 SDK。

在之后的演示项目中，为方便起见，我们选择第二种方法，直接使用 CDN 链接。

现在，我们已经将 Agora Web SDK NG 集成到项目中了。下一步我们要通过调用 Agora Web SDK NG 提供的核心 API 实现基础的音视频通话功能。