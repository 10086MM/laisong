/**
 * 运行配置：CDN / 微信提示 / 资源地址
 */
window.AMAP_KEY = 'YOUR_AMAP_KEY_HERE';

window.ASSET_CDN = '';
window.IS_WECHAT = /MicroMessenger/i.test(navigator.userAgent || '');
window.IS_GITHUB_HOST = /github\.io$/i.test(location.hostname || '');

(function setupCdn() {
  // 微信内常拦截外链 CDN，优先同源相对路径，降低风控与失败率
  if (window.IS_WECHAT) {
    window.ASSET_CDN = '';
    return;
  }
  // GitHub Pages 走 jsDelivr；失败时可在控制台手动清空 ASSET_CDN
  if (window.IS_GITHUB_HOST) {
    window.ASSET_CDN = 'https://cdn.jsdelivr.net/gh/10086MM/laisong@main/';
  }
})();

window.assetUrl = function (path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  var clean = String(path).replace(/^\.\//, '');
  // 去掉仅用于本地缓存的 query，方便 CDN 命中
  if (window.ASSET_CDN) clean = clean.replace(/\?.*$/, '');
  return (window.ASSET_CDN || '') + clean;
};

window.showWeChatTip = function () {
  if (!window.IS_WECHAT) return;
  if (document.getElementById('wechat-tip')) return;
  var tip = document.createElement('div');
  tip.id = 'wechat-tip';
  tip.className = 'wechat-tip';
  tip.innerHTML =
    '<div class="wechat-tip-card">' +
    '<p class="wechat-tip-title">微信内访问可能受限</p>' +
    '<p class="wechat-tip-text">若页面被拦截或图片加载失败，请点击右上角 <b>···</b>，选择「在浏览器中打开」。</p>' +
    '<button type="button" class="wechat-tip-btn" id="wechat-tip-close">我知道了</button>' +
    '</div>';
  document.body.appendChild(tip);
  document.getElementById('wechat-tip-close').onclick = function () {
    tip.remove();
    try { sessionStorage.setItem('wechat_tip_dismissed', '1'); } catch (e) {}
  };
  try {
    if (sessionStorage.getItem('wechat_tip_dismissed') === '1') tip.remove();
  } catch (e) {}
};

document.addEventListener('DOMContentLoaded', function () {
  window.showWeChatTip && window.showWeChatTip();
});
