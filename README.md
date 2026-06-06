# MissAV 去广告脚本

油猴（Tampermonkey）脚本，去除 MissAV 网站弹窗广告、横幅广告、恶意跳转及跟踪脚本，不留空白占位。

## 支持的域名

- `missav.ai`
- `missav.ws`
- `missav.com`
- `thisav.com`

## 功能

- **CSS 预注入隐藏** — 页面渲染前即隐藏广告元素，不留空白间隙
- **DOM 动态清理** — MutationObserver 实时监控，插入即删
- **网络请求拦截** — 劫持 XHR / fetch / iframe src，屏蔽 30+ 广告追踪域名
- **弹窗拦截** — 覆写 `window.open`，阻止恶意跳转
- **反检测** — 伪造广告检测变量，防止网站因检测到去广告而拒绝播放

## 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)（油猴）
2. 打开 Tampermonkey 控制面板 → **新建脚本**
3. 将 [Missav.user.js](Missav.user.js) 全部内容粘贴进去 → 保存
4. 访问上述域名即自动生效

或者直接点击下方链接安装：

> 将 [Missav.user.js](Missav.user.js) 拖入浏览器，Tampermonkey 会自动弹出安装提示。

## 自定义

如果网站更新了广告样式，用 F12 开发者工具找到新广告元素的 class/id，添加到脚本顶部 `CONFIG.adSelectors` 数组中即可：

```js
adSelectors: [
    // 你新增的选择器
    'div[class="新广告容器的class"]',
    // ...
],
```

广告域名同理，加到 `CONFIG.blockedUrlPatterns` 中：

```js
blockedUrlPatterns: [
    '新的广告域名.com',
    // ...
],
```

## 许可证

MIT
