# 两宋文化地图

开封（北宋）与杭州（南宋）的宋文化 / 城市更新地图站点。

## 打开方式

1. 首页：`index.html`
2. 地图：`map.html`

```powershell
python -m http.server 8080
```

- GitHub Pages：https://10086mm.github.io/laisong/
- 仓库：https://github.com/10086MM/laisong

## 微信显示「已停止访问」怎么办？

这是**微信对 `github.io` 域名的平台风控**，不是网站含有违法内容，也改不了 GitHub 域名本身。

### 立刻能用的办法

在微信拦截页点右上角 **··· → 在浏览器中打开**（Safari / Chrome / 系统浏览器）。浏览器里可以正常打开 GitHub Pages。

「申请恢复访问」对 github.io **基本无效**，不必反复申请。

### 彻底解决（推荐）：部署到码云 Gitee Pages

微信一般可打开 `*.gitee.io`。按下面做一次即可，之后把 **Gitee 链接**发给朋友：

1. 打开 https://gitee.com → 登录  
2. **新建仓库** → 选择「从 GitHub/GitLab 导入」→ 填入  
   `https://github.com/10086MM/laisong.git`  
3. 导入完成后进入仓库 → **服务 → Gitee Pages** → 启动  
   - 分支：`main`  
   - 目录：根目录 `/`  
4. 得到类似地址：  
   `https://你的用户名.gitee.io/laisong/`  
5. 把该地址填进项目里的 `js/config.js`：

```js
window.WECHAT_MIRROR_URL = 'https://你的用户名.gitee.io/laisong/';
```

6. 推送到 GitHub 后，再同步推到 Gitee（或在 Gitee 点「从 GitHub 刷新」）。

以后**微信里只分享 Gitee 链接**；电脑调试仍可用 GitHub。

### 其他可选国内托管

腾讯云静态网站托管 / 阿里云 OSS + CDN / 自有域名，同样可避开微信拦截。

## 其它说明

- GitHub 图片偏慢：已用缩略图与压缩；GitHub 域名下会走 jsDelivr  
- 首页与地图均为暗色调；景点介绍见 `js/poi-extra.js`

## 结构

- `index.html` / `css/landing.css` — 首页  
- `map.html` / `css/style.css` / `js/*` — 地图  
- `js/poi-extra.js` — 景点介绍、文化解读、出行提示  
- `image/pins` · `image/thumbs` — 缩略图  
- `vendor/leaflet` — 本地地图库  
