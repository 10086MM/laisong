# 两宋文化地图

开封（北宋）与杭州（南宋）的宋文化 / 城市更新地图站点。

## 打开方式

1. **首页**：`index.html`（文化叙事，不直接进地图）
2. **地图**：`map.html`

本地预览：

```powershell
cd "项目目录"
python -m http.server 8080
```

访问 `http://localhost:8080/`

## 为何 GitHub 上图片偏慢？

GitHub Pages / raw 对国内访问延迟高，也不是专业图床 CDN。页面一打开会请求多张缩略图 + 底图瓦片，所以会感觉慢。

当前缓解方式：

- 列表用 `image/thumbs/`，标记用更小的 `image/pins/`
- 在 `github.io` 域名下自动走 [jsDelivr](https://www.jsdelivr.com/) 加速仓库静态资源
- Leaflet 改为本地 `vendor/`，减少外链风控

若仍慢，可把站点迁到 Cloudflare Pages / 国内静态托管，或把图放到对象存储 CDN。

## 结构

- `index.html` + `css/landing.css` — 首页
- `map.html` + `css/style.css` + `js/*` — 地图
- `image/` / `image/thumbs/` / `image/pins/` — 原图与缩略图
- `vendor/leaflet/` — 本地地图库
