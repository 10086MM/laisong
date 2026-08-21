/**
 * 首页就绪后预加载全站图片与地图页关键资源，进入地图即可走缓存
 */
(function () {
  'use strict';

  var CONCURRENCY = 6;
  var STATUS_ID = 'preload-status';

  function urlOf(path) {
    return (typeof assetUrl === 'function') ? assetUrl(path) : path;
  }

  function ensureStatus() {
    var el = document.getElementById(STATUS_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = STATUS_ID;
    el.className = 'preload-status';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    return el;
  }

  function setStatus(text, done) {
    var el = ensureStatus();
    el.textContent = text;
    el.classList.toggle('is-done', !!done);
    if (done) {
      setTimeout(function () {
        el.classList.add('is-hide');
      }, 1600);
    }
  }

  function loadOne(src) {
    return new Promise(function (resolve) {
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        resolve(src);
      };
      // 图片用 Image；其它资源用 fetch 进缓存
      if (/\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(src)) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = finish;
        img.onerror = finish;
        img.src = src;
        return;
      }
      if (window.fetch) {
        fetch(src, { mode: 'cors', credentials: 'omit', cache: 'force-cache' })
          .then(function () { finish(); })
          .catch(function () { finish(); });
      } else {
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = src;
        link.onload = finish;
        link.onerror = finish;
        document.head.appendChild(link);
        setTimeout(finish, 4000);
      }
    });
  }

  function runQueue(list, onProgress) {
    var i = 0;
    var done = 0;
    var total = list.length;
    if (!total) return Promise.resolve();

    return new Promise(function (resolve) {
      function next() {
        if (i >= total) return;
        var idx = i++;
        var src = list[idx];
        loadOne(src).then(function () {
          done += 1;
          if (onProgress) onProgress(done, total);
          if (done >= total) resolve();
          else next();
        });
      }
      var workers = Math.min(CONCURRENCY, total);
      for (var w = 0; w < workers; w++) next();
    });
  }

  function waitHeroReady() {
    return new Promise(function (resolve) {
      var hero = document.querySelector('.home-hero-img');
      var finish = function () { resolve(); };
      if (!hero) {
        if (document.readyState === 'complete') finish();
        else window.addEventListener('load', finish, { once: true });
        return;
      }
      if (hero.complete && hero.naturalWidth > 0) {
        // 再等一帧，保证首屏绘制完成
        requestAnimationFrame(function () { setTimeout(finish, 80); });
        return;
      }
      hero.addEventListener('load', function () {
        requestAnimationFrame(function () { setTimeout(finish, 80); });
      }, { once: true });
      hero.addEventListener('error', finish, { once: true });
      // 兜底：最长 8s 也开始预加载
      setTimeout(finish, 8000);
    });
  }

  function startPreload() {
    var images = (window.ASSET_MANIFEST || []).map(urlOf);
    var pages = (window.PAGE_PREFETCH || []).map(urlOf);
    // 去重
    var seen = {};
    var list = [];
    images.concat(pages).forEach(function (u) {
      if (!u || seen[u]) return;
      seen[u] = 1;
      list.push(u);
    });

    if (!list.length) return;

    setStatus('正在预加载地图与景点图片 0/' + list.length + '…', false);

    runQueue(list, function (done, total) {
      setStatus('正在预加载地图与景点图片 ' + done + '/' + total + '…', false);
    }).then(function () {
      try { sessionStorage.setItem('laisong_assets_ready', '1'); } catch (e) {}
      setStatus('资源已就绪，可进入地图', true);
      document.body.classList.add('assets-ready');
    });
  }

  waitHeroReady().then(function () {
    // 空闲时再拉，避免抢首屏带宽；不支持则直接开始
    if (window.requestIdleCallback) {
      requestIdleCallback(function () { startPreload(); }, { timeout: 1200 });
    } else {
      setTimeout(startPreload, 200);
    }
  });
})();
