/**
 * 地图 Key（可选）
 * 未配置时使用高德公开栅格 / Carto 底图
 */
window.AMAP_KEY = 'YOUR_AMAP_KEY_HERE';

/**
 * 静态资源 CDN（缓解 GitHub 国内访问慢）
 * 本地打开请保持空字符串；发布到 GitHub Pages 时自动走 jsDelivr
 */
window.ASSET_CDN = '';
(function () {
  const host = location.hostname || '';
  if (/github\.io$/i.test(host) || host === 'raw.githubusercontent.com') {
    window.ASSET_CDN = 'https://cdn.jsdelivr.net/gh/10086MM/laisong@main/';
  }
})();

window.assetUrl = function (path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const clean = String(path).replace(/^\.\//, '');
  const base = window.ASSET_CDN || '';
  return base ? base + clean : clean;
};
