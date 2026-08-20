/**
 * 运行配置：CDN / 微信提示 / 资源地址
 */
window.AMAP_KEY = 'YOUR_AMAP_KEY_HERE';

window.ASSET_CDN = '';
window.IS_WECHAT = /MicroMessenger/i.test(navigator.userAgent || '');
window.IS_GITHUB_HOST = /github\.io$/i.test(location.hostname || '');
window.IS_GITEE_HOST = /gitee\.io$/i.test(location.hostname || '');

(function setupCdn() {
  // 微信内优先同源，降低外链拦截
  if (window.IS_WECHAT) {
    window.ASSET_CDN = '';
    return;
  }
  // 仅 GitHub Pages 尝试 jsDelivr；Gitee / 国内托管保持同源
  if (window.IS_GITHUB_HOST) {
    window.ASSET_CDN = 'https://cdn.jsdelivr.net/gh/10086MM/laisong@main/';
  }
})();

window.assetUrl = function (path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  var clean = String(path).replace(/^\.\//, '');
  if (window.ASSET_CDN) clean = clean.replace(/\?.*$/, '');
  return (window.ASSET_CDN || '') + clean;
};

/** 微信可分享地址（帽子云） */
window.WECHAT_MIRROR_URL = 'https://lias-a6hz201yp.maozi.io/';

window.showWeChatTip = function () {
  if (!window.IS_WECHAT) return;
  if (document.getElementById('wechat-tip')) return;

  var onGithub = window.IS_GITHUB_HOST;
  var mirror = window.WECHAT_MIRROR_URL || '';
  var tip = document.createElement('div');
  tip.id = 'wechat-tip';
  tip.className = 'wechat-tip';

  var text =
    '微信常拦截 github.io 域名，这是平台风控，不是网站内容违规。' +
    '请点击右上角 <b>···</b>，选择「在浏览器中打开」。';
  if (mirror) {
    text +=
      '<br><br>或复制备用链接（码云）后在浏览器粘贴打开：<br><code class="wechat-tip-link">' +
      mirror +
      '</code>';
  }

  tip.innerHTML =
    '<div class="wechat-tip-card">' +
    '<p class="wechat-tip-title">' + (onGithub ? '微信无法直接打开 GitHub 站点' : '微信内访问提示') + '</p>' +
    '<p class="wechat-tip-text">' + text + '</p>' +
    '<div class="wechat-tip-actions">' +
    (mirror
      ? '<button type="button" class="wechat-tip-btn" id="wechat-tip-copy">复制备用链接</button>'
      : '') +
    '<button type="button" class="wechat-tip-btn wechat-tip-btn-ghost" id="wechat-tip-close">我知道了</button>' +
    '</div></div>';

  document.body.appendChild(tip);

  var close = function () {
    tip.remove();
    try { sessionStorage.setItem('wechat_tip_dismissed', '1'); } catch (e) {}
  };
  document.getElementById('wechat-tip-close').onclick = close;

  var copyBtn = document.getElementById('wechat-tip-copy');
  if (copyBtn && mirror) {
    copyBtn.onclick = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mirror).then(function () {
          copyBtn.textContent = '已复制';
        }).catch(function () {
          window.prompt('请手动复制：', mirror);
        });
      } else {
        window.prompt('请手动复制：', mirror);
      }
    };
  }

  try {
    if (sessionStorage.getItem('wechat_tip_dismissed') === '1') tip.remove();
  } catch (e) {}
};

document.addEventListener('DOMContentLoaded', function () {
  window.showWeChatTip && window.showWeChatTip();
});
