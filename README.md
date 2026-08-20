# 两宋文化地图

开封（北宋）与杭州（南宋）的宋文化 / 城市更新地图站点。

## 打开方式

1. **首页（推荐）**：打开 `index.html` — 文化叙事首页，**不会**直接进入地图  
2. **地图**：从首页点击「开启寻宋之旅」，或直接打开 `map.html`

也可本地起服务：

```powershell
cd "项目目录"
python -m http.server 8080
```

然后访问 `http://localhost:8080/`

## 结构

- `index.html` + `css/landing.css` — 首页
- `map.html` + `css/style.css` + `js/*` — 地图应用
- `image/` — 景点与开场图片
