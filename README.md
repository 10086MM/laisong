# 两宋文化地图

开封（北宋）与杭州（南宋）的宋文化 / 城市更新地图站点。

## 打开方式

1. 首页：`index.html`
2. 地图：`map.html`

```powershell
python -m http.server 8080
```

## 访问说明（重要）

### 为什么 GitHub 上图片偏慢？
GitHub Pages 对国内不是专业图床。已做：小图 `pins/` + `thumbs/`、古地图再压缩、GitHub 域名下走 jsDelivr。

### 微信提示「已停止访问」/ 风控
这是微信对 `github.io` 等域名的常见限制，**不是网站代码错误**。请：

1. 点击右上角 `···` → **在浏览器中打开**  
2. 或把项目部署到 Cloudflare Pages / 国内静态托管后再用微信分享  

站内已加微信提示条；微信内会改用同源相对路径，减少外链拦截。

### 色调
首页与地图页均为暗色墨调；现代地图瓦片已压暗，减少跳转反差。

## 结构

- `index.html` / `css/landing.css` — 首页
- `map.html` / `css/style.css` / `js/*` — 地图
- `js/poi-extra.js` — 加长景点介绍、文化解读、出行提示
- `image/pins` · `image/thumbs` — 缩略图
- `vendor/leaflet` — 本地地图库
