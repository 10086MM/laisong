/**
 * 宋代古地图
 * 标点百分比 = 底图上「文字标注」中心位置（相对整张图片）
 */
window.ANCIENT_MAPS = {
  kaifeng: {
    title: '北宋东京汴梁城坊图',
    era: '北向上 · 对准底图文字标注',
    image: 'image/map-kaifeng-ancient.jpg?v=6',
    credit: '已按底图地名重新校准',
    defaultZoom: 1.05
  },
  hangzhou: {
    title: '南宋临安府城图',
    era: '北向上 · 对准底图文字标注',
    image: 'image/map-hangzhou-ancient.jpg?v=7',
    credit: '已按底图地名重新校准',
    defaultZoom: 1.1
  }
};

/**
 * 校准说明（对照底图印刷文字）：
 * 开封：汴河约在图高 50%；相国寺在河南；州桥压在汴河上；开封府在左下。
 * 杭州：西湖在左；城在右；皇城在城南；六和塔在左下江边（避开图例）。
 */
window.ANCIENT_POI_POS = {
  /* ========== 开封 ========== */
  'kf-longting':   { x: 50, y: 29 }, /* 「龙亭」紧贴大内南 */
  'kf-tieta':      { x: 76, y: 26 }, /* 「铁塔」东北 */
  'kf-jinming':    { x: 23, y: 27 }, /* 「金明池」西北 */
  'kf-shuntian':   { x: 17, y: 44 }, /* 「顺天门」城门楼正中（不在门左侧） */
  'kf-zhouqiao':   { x: 50, y: 50 }, /* 「州桥」压在汴河中轴 */
  'kf-qingming':   { x: 25, y: 61 }, /* 「清明上河园」标注处（河南西侧，不在护城河里） */
  'kf-tianbo':     { x: 34, y: 58 }, /* 「天波杨府」河南偏西 */
  'kf-xiangguo':   { x: 50, y: 64 }, /* 「相国寺」河南中轴（不在河上） */
  'kf-shuanglong': { x: 66, y: 42 }, /* 内城偏东 */
  'kf-baogong':    { x: 27, y: 69 }, /* 「包公祠」西南 */
  'kf-kaifengfu':  { x: 30, y: 76 }, /* 「开封府」左下标注 */
  'kf-fanta':      { x: 76, y: 74 }, /* 「繁塔」东南 */
  'kf-citywall':   { x: 50, y: 86 }, /* 南薰门城墙 */
  'kf-museum':     { x: 14, y: 80 }, /* 城西外侧 */
  'kf-hanyuan':    { x: 68, y: 18 },
  'kf-yanqing':    { x: 42, y: 58 },
  'kf-shudian':    { x: 55, y: 60 },
  'kf-qisheng':    { x: 48, y: 40 },
  'kf-wansui':     { x: 58, y: 16 },
  'kf-lijing':     { x: 18, y: 48 },
  'kf-huiguan':    { x: 62, y: 66 },
  'kf-yuwang':     { x: 84, y: 84 },

  /* ========== 杭州 ========== */
  'hz-yuewang':    { x: 25, y: 21 }, /* 「岳王庙」湖北 */
  'hz-westlake':   { x: 27, y: 39 }, /* 「西湖」二字附近湖面 */
  'hz-leifeng':    { x: 18, y: 52 }, /* 「雷峰塔」湖南岸塔绘正上方 */
  'hz-jingci':     { x: 25, y: 55 }, /* 「净慈寺」雷峰右下方寺院标注 */
  'hz-deshou':     { x: 69, y: 28 }, /* 「德寿宫」城内东北 */
  'hz-yujie':      { x: 52, y: 37 }, /* 「御街」中轴大街正中（压在御街二字上） */
  'hz-museum':     { x: 76, y: 32 }, /* 德寿宫东侧 */
  'hz-hefang':     { x: 67, y: 43 }, /* 「河坊街」右侧街道标注上 */
  'hz-wushan':     { x: 74, y: 48 }, /* 「吴山」山体 */
  'hz-huangcheng': { x: 57, y: 61 }, /* 「皇城」城南围墙内 */
  'hz-bagua':      { x: 73, y: 69 }, /* 「八卦田」皇城东南 */
  'hz-guanyao':    { x: 70, y: 75 }, /* 「官窑」八卦田南 */
  'hz-songcheng':  { x: 50, y: 79 }, /* 「宋城」南门外 */
  'hz-liuheta':    { x: 29, y: 79 }, /* 「六和塔」西南江边 */
  'hz-lingyin':    { x: 10, y: 30 },
  'hz-feilai':     { x: 8, y: 34 },
  'hz-baochu':     { x: 30, y: 16 },
  'hz-sudi':       { x: 20, y: 42 },
  'hz-gushan':     { x: 28, y: 30 },
  'hz-santan':     { x: 24, y: 46 },
  'hz-qianwang':   { x: 36, y: 48 },
  'hz-wansong':    { x: 54, y: 56 }
};

window.getAncientPos = function (poi) {
  return ANCIENT_POI_POS[poi.id] || { x: 50, y: 50 };
};

window.getAncientDefaultZoom = function (cityKey) {
  return (ANCIENT_MAPS[cityKey] && ANCIENT_MAPS[cityKey].defaultZoom) || 1.05;
};

window.getPoiDisplayIndex = function (poiId, cityKey) {
  const list = SONG_POIS[cityKey].pois;
  const idx = list.findIndex(p => p.id === poiId);
  return idx >= 0 ? idx + 1 : 0;
};
