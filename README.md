# 两宋文化地图

开封（北宋）与杭州（南宋）的宋文化 / 城市更新地图站点。

## 打开方式

1. 首页：`index.html`
2. 地图：`map.html`

```powershell
python -m http.server 8080
```

- 帽子云（推荐分享）：https://lias-a6hz201yp.maozi.io/
- GitHub Pages：https://10086mm.github.io/laisong/
- 仓库：https://github.com/10086MM/laisong

## 微信访问

请直接分享帽子云链接（一般不被微信拦截 github.io）：

**https://lias-a6hz201yp.maozi.io/**

若仍打开了 GitHub 版被拦截：右上角 **··· → 在浏览器中打开**，或改用上面的帽子云地址。

## 其它说明

- GitHub 图片偏慢：已用缩略图与压缩；GitHub 域名下会走 jsDelivr  
- 首页与地图均为暗色调；景点介绍见 `js/poi-extra.js`

## 结构

- `index.html` / `css/landing.css` — 首页  
- `map.html` / `css/style.css` / `js/*` — 地图  
- `js/poi-extra.js` — 景点介绍、文化解读、出行提示  
- `image/pins` · `image/thumbs` — 缩略图  
- `vendor/leaflet` — 本地地图库  
