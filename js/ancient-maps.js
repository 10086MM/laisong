/**
 * 宋代古地图
 * 底图：结合历史疆域设色（绿陆蓝水）+ 城坊木刻细描风格重新绘制
 * 参考 Wikimedia Commons 下载的《北宋分路全图》《Ancient hangzhou》等图
 * 标点百分比 = 底图上对应地名/方位中心（相对整张图片）
 */
window.ANCIENT_MAPS = {
  kaifeng: {
    title: '北宋东京汴梁城坊图',
    era: '北向上 · 城坊细部 + 舆图设色',
    image: 'image/map-kaifeng-ancient.jpg?v=30',
    credit: '风格融合历史舆图与城坊图 · 景点对准图中标注',
    defaultZoom: 1
  },
  hangzhou: {
    title: '南宋临安府城图',
    era: '北向上 · 湖山城郭同幅',
    image: 'image/map-hangzhou-ancient.jpg?v=30',
    credit: '风格融合历史舆图与城坊图 · 景点对准图中标注',
    defaultZoom: 1
  }
};

/**
 * 开封：宫城偏北，汴河横贯中部，相国寺/州桥在中轴，铁塔东北，繁塔偏南。
 * 杭州：西湖在左，城郭在右，皇城偏南，六和塔近钱塘江。
 */
window.ANCIENT_POI_POS = {
  /* ========== 开封（对准新底图标注） ========== */
  'kf-jinming':    { x: 32, y: 18 }, /* 金明池 · 西北苑囿 */
  'kf-longting':   { x: 50, y: 22 }, /* 龙亭 · 大内南 */
  'kf-tieta':      { x: 78, y: 24 }, /* 铁塔 · 东北 */
  'kf-wansui':     { x: 62, y: 16 }, /* 万岁山 · 北侧 */
  'kf-hanyuan':    { x: 72, y: 20 }, /* 翰园 · 铁塔附近 */
  'kf-shuntian':   { x: 16, y: 46 }, /* 顺天门 · 西城 */
  'kf-lijing':     { x: 18, y: 52 }, /* 丽景门 · 西侧 */
  'kf-zhouqiao':   { x: 50, y: 50 }, /* 州桥 · 汴河中轴 */
  'kf-qisheng':    { x: 48, y: 42 }, /* 七盛角 · 内城 */
  'kf-yanqing':    { x: 42, y: 56 }, /* 延庆观 */
  'kf-shudian':    { x: 55, y: 58 }, /* 书店街 */
  'kf-xiangguo':   { x: 50, y: 62 }, /* 相国寺 · 河南中轴 */
  'kf-qingming':   { x: 22, y: 60 }, /* 清明上河园 · 西侧汴河 */
  'kf-tianbo':     { x: 34, y: 56 }, /* 天波杨府 */
  'kf-shuanglong': { x: 66, y: 44 }, /* 双龙巷 · 内城偏东 */
  'kf-baogong':    { x: 28, y: 70 }, /* 包公祠 */
  'kf-kaifengfu':  { x: 32, y: 76 }, /* 开封府 */
  'kf-huiguan':    { x: 60, y: 68 }, /* 山陕甘会馆 */
  'kf-museum':     { x: 14, y: 78 }, /* 开封博物馆 · 城西 */
  'kf-citywall':   { x: 50, y: 88 }, /* 城墙 · 南段 */
  'kf-fanta':      { x: 72, y: 82 }, /* 繁塔 · 东南 */
  'kf-yuwang':     { x: 80, y: 86 }, /* 禹王台 */

  /* ========== 杭州（对准新底图标注） ========== */
  'hz-baochu':     { x: 28, y: 16 }, /* 保俶塔 · 湖北 */
  'hz-yuewang':    { x: 16, y: 22 }, /* 岳王庙 · 湖西岸 */
  'hz-lingyin':    { x: 8,  y: 28 }, /* 灵隐 · 西北山 */
  'hz-feilai':     { x: 10, y: 32 }, /* 飞来峰 */
  'hz-gushan':     { x: 26, y: 30 }, /* 孤山 */
  'hz-westlake':   { x: 24, y: 40 }, /* 西湖湖面 */
  'hz-sudi':       { x: 18, y: 42 }, /* 苏堤 */
  'hz-santan':     { x: 22, y: 46 }, /* 三潭印月 */
  'hz-qianwang':   { x: 36, y: 48 }, /* 钱王祠 · 湖滨 */
  'hz-leifeng':    { x: 18, y: 55 }, /* 雷峰塔 · 湖南 */
  'hz-jingci':     { x: 24, y: 58 }, /* 净慈寺 */
  'hz-deshou':     { x: 64, y: 30 }, /* 德寿宫 · 城内东北 */
  'hz-museum':     { x: 72, y: 34 }, /* 南宋博物院 */
  'hz-yujie':      { x: 52, y: 40 }, /* 御街 · 中轴 */
  'hz-hefang':     { x: 62, y: 48 }, /* 河坊街 */
  'hz-wushan':     { x: 68, y: 52 }, /* 吴山 */
  'hz-wansong':    { x: 54, y: 60 }, /* 万松书院 */
  'hz-huangcheng': { x: 56, y: 68 }, /* 皇城 · 城南 */
  'hz-bagua':      { x: 74, y: 72 }, /* 八卦田 · 东南 */
  'hz-guanyao':    { x: 70, y: 78 }, /* 官窑 */
  'hz-songcheng':  { x: 48, y: 82 }, /* 宋城 · 南门外 */
  'hz-liuheta':    { x: 78, y: 86 }  /* 六和塔 · 江畔 */
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
