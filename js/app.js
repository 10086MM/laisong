/**
 * 两宋文化地图 · 主逻辑（支持现代 / 宋代古地图切换）
 */
(function () {
  'use strict';

  let map = null;
  let mapEngine = null; // 'leaflet' | 'amap'
  let markers = [];
  let currentCity = 'kaifeng';
  let currentFilter = 'all';
  let mapMode = 'modern';
  let selectedPoi = null;
  let ancientZoom = 1;
  let ancientPan = { x: 0, y: 0 };
  let mapReady = false;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function poiThumb(poi) {
    const src = (poi && poi.image) || '';
    return assetUrl(src.replace(/^image\//, 'image/thumbs/'));
  }

  function poiPin(poi) {
    const src = (poi && poi.image) || '';
    return assetUrl(src.replace(/^image\//, 'image/pins/'));
  }

  function poiFull(poi) {
    return assetUrl((poi && poi.image) || '');
  }

  function safeImg(src, fallback, alt, className) {
    const fb = assetUrl(fallback || 'image/thumbs/brand-logo.jpg');
    const cls = className ? ` class="${className}"` : '';
    const url = assetUrl(src);
    return `<img${cls} src="${url}" alt="${alt || ''}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${fb}'">`;
  }

  function init() {
    const params = new URLSearchParams(location.search);
    const city = params.get('city');
    if (city === 'kaifeng' || city === 'hangzhou') currentCity = city;

    const logo = document.querySelector('.brand-logo');
    if (logo && logo.getAttribute('src')) logo.src = assetUrl(logo.getAttribute('src'));

    bindEvents();
    updateFilterCounts();
    renderPoiList();
    updateMapModeUI();
    syncCityTabs();
    loadMap();
  }

  function syncCityTabs() {
    $$('.city-tab').forEach(t => t.classList.toggle('active', t.dataset.city === currentCity));
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === '1') resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        script.dataset.loaded = '1';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadMap() {
    const key = window.AMAP_KEY;
    const useAmap = key && key !== 'YOUR_AMAP_KEY_HERE';

    const start = useAmap
      ? loadScript(`https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Scale`)
          .then(() => createAmapMap())
          .catch(() => createLeafletMap())
      : Promise.resolve().then(() => createLeafletMap());

    start
      .then(() => {
        applyMapMode();
        onMapReady();
      })
      .catch(() => {
        applyMapMode();
        onMapReady();
      });
  }

  function onMapReady() {
    mapReady = true;
    requestAnimationFrame(() => {
      if (mapEngine === 'leaflet' && map) map.invalidateSize();
      if (mapEngine === 'amap' && map && map.resize) map.resize();
    });
  }

  function resetMapContainer() {
    const container = $('#map-container');
    container.innerHTML = '';
    container.classList.remove('fallback-map', 'hidden-mode');
    container.style.display = 'block';
  }

  function createLeafletMap() {
    if (!window.L) throw new Error('Leaflet not loaded');
    if (mapEngine === 'leaflet' && map) return;

    if (map) destroyMap();
    resetMapContainer();

    const cityData = SONG_POIS[currentCity];
    map = L.map('map-container', {
      center: [cityData.center[1], cityData.center[0]],
      zoom: cityData.zoom,
      zoomControl: false,
      attributionControl: true
    });

    // 高德路网（国内稳）；失败回退暗色 Carto
    const gaode = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: '1234',
      attribution: '&copy; 高德地图'
    });
    const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    });

    let tileErrors = 0;
    gaode.on('tileerror', () => {
      tileErrors += 1;
      if (tileErrors >= 4 && map.hasLayer(gaode)) {
        map.removeLayer(gaode);
        cartoDark.addTo(map);
        map._songTileLayer = cartoDark;
        $('#map-container')?.classList.remove('tiles-dimmed');
      }
    });
    gaode.addTo(map);
    map._songTileLayer = gaode;
    // 高德浅色底图压暗，与首页暗色调衔接
    $('#map-container')?.classList.add('tiles-dimmed');

    mapEngine = 'leaflet';
  }

  function createAmapMap() {
    if (mapEngine === 'amap' && map) return;

    if (map) destroyMap();
    resetMapContainer();

    const cityData = SONG_POIS[currentCity];
    map = new AMap.Map('map-container', {
      zoom: cityData.zoom,
      center: cityData.center,
      mapStyle: 'amap://styles/dark',
      viewMode: '2D',
      features: ['bg', 'road', 'building', 'point'],
      zooms: [10, 18]
    });
    map.addControl(new AMap.Scale({ position: { bottom: '24px', left: '24px' } }));
    mapEngine = 'amap';
  }

  function destroyMap() {
    clearMarkers();
    if (!map) return;
    if (mapEngine === 'leaflet') {
      map.remove();
    }
    map = null;
    mapEngine = null;
  }

  function buildPinHtml(poi, idx) {
    const num = getPoiDisplayIndex(poi.id, currentCity) || (idx + 1);
    return createPhotoPinMarkup(poi, num);
  }

  function createPhotoPinMarkup(poi, num) {
    const typeClass = poi.category === 'renewal' ? 'is-renewal' : 'is-song';
    return `
      <div class="poi-photo-marker">
        <div class="poi-photo-pin ${typeClass}">
          <div class="poi-photo-head">
            ${safeImg(poiPin(poi), poiThumb(poi), poi.name, '')}
          </div>
          <span class="poi-photo-index">${num}</span>
        </div>
        <div class="poi-photo-label">${poi.name}</div>
      </div>
    `;
  }

  const PHOTO_PIN = { width: 112, height: 72, anchorX: 56, anchorY: 58 };

  function mapSetView(lng, lat, zoom) {
    if (!map) return;
    if (mapEngine === 'leaflet') map.setView([lat, lng], zoom);
    else map.setZoomAndCenter(zoom, [lng, lat]);
  }

  function mapLocateCity() {
    const cityData = SONG_POIS[currentCity];
    mapSetView(cityData.center[0], cityData.center[1], cityData.zoom);
  }

  function mapZoomIn() {
    if (!map) return;
    if (mapEngine === 'leaflet') map.zoomIn();
    else map.zoomIn();
  }

  function mapZoomOut() {
    if (!map) return;
    if (mapEngine === 'leaflet') map.zoomOut();
    else map.zoomOut();
  }

  function ensureModernMap() {
    if (map) return Promise.resolve();
    return Promise.resolve().then(() => createLeafletMap());
  }

  /* ---------- 地图模式切换 ---------- */
  function setMapMode(mode) {
    if (mapMode === mode) return;
    mapMode = mode;
    closeBottomSheet();
    applyMapMode();
    updateMapModeUI();
  }

  function applyMapMode() {
    const modernEl = $('#map-container');
    const ancientEl = $('#ancient-map-container');

    if (mapMode === 'ancient') {
      modernEl.classList.add('hidden-mode');
      ancientEl.classList.add('active');
      ancientEl.setAttribute('aria-hidden', 'false');
      renderAncientMap();
      clearMarkers();
    } else {
      modernEl.classList.remove('hidden-mode');
      ancientEl.classList.remove('active');
      ancientEl.setAttribute('aria-hidden', 'true');
      ensureModernMap().then(() => {
        if (mapEngine === 'leaflet' && map) {
          setTimeout(() => map.invalidateSize(), 120);
        }
        if (mapEngine === 'amap' && map) {
          map.setMapStyle('amap://styles/normal');
        }
        renderMarkers();
      });
    }
  }

  function updateMapModeUI() {
    $$('.mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mapMode);
    });
    const label = $('#mode-label');
    if (label) label.textContent = mapMode === 'modern' ? '古地图' : '现代';
    document.body.classList.toggle('ancient-theme', mapMode === 'ancient');
  }

  /* ---------- 宋代古地图 ---------- */
  function renderAncientMap() {
    const container = $('#ancient-map-container');
    container.innerHTML = '';

    const mapData = ANCIENT_MAPS[currentCity];
    const pois = getFilteredPois();

    const viewport = document.createElement('div');
    viewport.className = 'ancient-viewport';
    viewport.id = 'ancient-viewport';

    const inner = document.createElement('div');
    inner.className = 'ancient-inner';
    inner.id = 'ancient-inner';
    inner.style.transform = `translate(${ancientPan.x}px, ${ancientPan.y}px) scale(${ancientZoom})`;

    const imgWrap = document.createElement('div');
    imgWrap.className = 'ancient-img-wrap';

    // 古地图走同源路径（不走 CDN），避免外链失败/过慢时容器塌成细条、标注挤成一列
    const localSrc = String(mapData.image || '').replace(/^\.\//, '');
    const img = document.createElement('img');
    img.className = 'ancient-map-img';
    img.alt = mapData.title;
    img.draggable = false;
    img.decoding = 'async';
    img.src = localSrc;

    const loading = document.createElement('div');
    loading.className = 'ancient-map-loading';
    loading.textContent = '古地图加载中…';

    const pinsLayer = document.createElement('div');
    pinsLayer.className = 'ancient-pins-layer';
    pois.forEach((poi) => {
      const pos = getAncientPos(poi, currentCity);
      const num = getPoiDisplayIndex(poi.id, currentCity);
      const pin = createAncientPin(poi, num, pos);
      pinsLayer.appendChild(pin);
    });

    const markReady = () => {
      imgWrap.classList.add('is-ready');
      // 宽度铺满后，竖向居中长图，便于看到城内主体
      requestAnimationFrame(() => {
        ancientZoom = getAncientDefaultZoom(currentCity);
        ancientPan = { x: 0, y: 0 };
        applyAncientTransform();
        if (selectedPoi) highlightMapPin(selectedPoi.id);
      });
    };

    img.addEventListener('load', markReady);
    img.addEventListener('error', () => {
      // 同源失败时再试一次无 query 的路径
      if (img.dataset.retried) {
        loading.textContent = '古地图加载失败，请刷新重试';
        return;
      }
      img.dataset.retried = '1';
      img.src = localSrc.replace(/\?.*$/, '') + '?v=12';
    });
    if (img.complete && img.naturalWidth > 0) markReady();

    imgWrap.appendChild(img);
    imgWrap.appendChild(loading);
    imgWrap.appendChild(pinsLayer);

    inner.appendChild(imgWrap);
    viewport.appendChild(inner);
    container.appendChild(viewport);

    const badge = document.createElement('div');
    badge.className = 'ancient-era-badge';
    badge.innerHTML = `<span>${mapData.title}</span><span class="era">${mapData.era}</span><span class="era">${mapData.credit || ''}</span>`;
    container.appendChild(badge);

    setupAncientGestures(viewport, inner);
    ancientZoom = getAncientDefaultZoom(currentCity);
    ancientPan = { x: 0, y: 0 };
    applyAncientTransform();
  }

  function createAncientPin(poi, num, pos) {
    const pin = document.createElement('div');
    pin.className = 'ancient-pin';
    pin.dataset.id = poi.id;
    pin.style.left = pos.x + '%';
    pin.style.top = pos.y + '%';
    pin.innerHTML = createPhotoPinMarkup(poi, num);
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPoi(poi);
    });
    return pin;
  }

  function setupAncientGestures(viewport, inner) {
    let dragging = false;
    let startX, startY, startPanX, startPanY;
    let lastDist = 0;

    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.ancient-pin')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = ancientPan.x;
      startPanY = ancientPan.y;
      viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      ancientPan.x = startPanX + (e.clientX - startX);
      ancientPan.y = startPanY + (e.clientY - startY);
      applyAncientTransform();
    });

    window.addEventListener('mouseup', () => {
      dragging = false;
      if (viewport) viewport.style.cursor = 'grab';
    });

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? -0.15 : 0.15;
      ancientZoom = Math.min(4.5, Math.max(0.55, ancientZoom + step));
      applyAncientTransform();
    }, { passive: false });

    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        if (e.target.closest('.ancient-pin')) return;
        dragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startPanX = ancientPan.x;
        startPanY = ancientPan.y;
      } else if (e.touches.length === 2) {
        lastDist = getTouchDist(e.touches);
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && dragging) {
        ancientPan.x = startPanX + (e.touches[0].clientX - startX);
        ancientPan.y = startPanY + (e.touches[0].clientY - startY);
        applyAncientTransform();
      } else if (e.touches.length === 2) {
        const dist = getTouchDist(e.touches);
        if (lastDist > 0) {
          ancientZoom = Math.min(4.5, Math.max(0.55, ancientZoom * (dist / lastDist)));
          applyAncientTransform();
        }
        lastDist = dist;
      }
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      dragging = false;
      lastDist = 0;
    });
  }

  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function ancientZoomIn() {
    ancientZoom = Math.min(4.5, ancientZoom + 0.3);
    applyAncientTransform();
  }

  function ancientZoomOut() {
    ancientZoom = Math.max(0.55, ancientZoom - 0.3);
    applyAncientTransform();
  }

  function ancientResetView() {
    ancientZoom = getAncientDefaultZoom(currentCity);
    ancientPan = { x: 0, y: 0 };
    applyAncientTransform();
  }

  function applyAncientTransform() {
    const inner = $('#ancient-inner');
    if (inner) inner.style.transform = `translate(${ancientPan.x}px, ${ancientPan.y}px) scale(${ancientZoom})`;
  }

  /* ---------- 标记渲染（现代地图） ---------- */
  function getFilteredPois() {
    const pois = SONG_POIS[currentCity].pois;
    if (currentFilter === 'all') return pois;
    if (currentFilter === 'song') return pois.filter(p => p.category === 'song');
    if (currentFilter === 'renewal') return pois.filter(p => p.category === 'renewal');
    return pois;
  }

  function renderMarkers() {
    if (mapMode === 'ancient') {
      renderAncientMap();
      return;
    }
    if (!map) return;
    clearMarkers();

    const pois = getFilteredPois();
    pois.forEach((poi, idx) => {
      if (mapEngine === 'leaflet') {
        const icon = L.divIcon({
          className: 'leaflet-poi-marker',
          html: buildPinHtml(poi, idx),
          iconSize: [PHOTO_PIN.width, PHOTO_PIN.height],
          iconAnchor: [PHOTO_PIN.anchorX, PHOTO_PIN.anchorY]
        });
        const marker = L.marker([poi.lat, poi.lng], { icon, zIndexOffset: 100 + idx });
        marker._poiId = poi.id;
        marker.on('click', () => selectPoi(poi));
        marker.addTo(map);
        markers.push(marker);
      } else {
        const markerContent = document.createElement('div');
        markerContent.innerHTML = buildPinHtml(poi, idx);
        const marker = new AMap.Marker({
          position: [poi.lng, poi.lat],
          content: markerContent,
          offset: new AMap.Pixel(-PHOTO_PIN.anchorX, -PHOTO_PIN.anchorY),
          zIndex: 100 + idx
        });
        marker._poiId = poi.id;
        marker.on('click', () => selectPoi(poi));
        marker.setMap(map);
        markers.push(marker);
      }
    });

    if (selectedPoi) highlightMapPin(selectedPoi.id);

    if (pois.length === 0) return;

    if (mapEngine === 'leaflet') {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.12));
    } else {
      map.setFitView(markers, false, [60, 60, 60, 60]);
    }
  }

  function clearMarkers() {
    if (!markers.length) return;
    markers.forEach(m => {
      if (mapEngine === 'leaflet') m.remove();
      else m.setMap(null);
    });
    markers = [];
  }

  function getMarkerPinEl(marker) {
    if (mapEngine === 'leaflet') {
      const el = marker.getElement && marker.getElement();
      return el ? el.querySelector('.poi-photo-marker') : null;
    }
    const content = marker.getContent && marker.getContent();
    if (!content) return null;
    if (content.classList && content.classList.contains('poi-photo-marker')) return content;
    return content.querySelector ? content.querySelector('.poi-photo-marker') : null;
  }

  function highlightMapPin(poiId) {
    if (mapMode === 'ancient') {
      if (!poiId) {
        $$('.ancient-pin').forEach(p => p.classList.remove('focused'));
        return;
      }
      const poi = SONG_POIS[currentCity].pois.find(p => p.id === poiId);
      if (poi) focusAncientPin(poi);
      return;
    }

    markers.forEach((marker) => {
      const pin = getMarkerPinEl(marker);
      const active = !!poiId && marker._poiId === poiId;
      if (pin) pin.classList.toggle('is-active', active);
      if (mapEngine === 'leaflet') {
        marker.setZIndexOffset(active ? 1200 : 100);
      } else if (marker.setzIndex) {
        marker.setzIndex(active ? 1200 : 100);
      }
    });
  }

  /* ---------- POI 交互 ---------- */
  function selectPoi(poi, options) {
    const opts = options || {};
    selectedPoi = poi;

    if (mapMode === 'modern' && map) {
      mapSetView(poi.lng, poi.lat, opts.zoom || 16);
      highlightMapPin(poi.id);
    } else if (mapMode === 'ancient') {
      highlightMapPin(poi.id);
    }

    showBottomSheet(poi);
    highlightPoiInList(poi.id);

    // 桌面端：列表/标注点击同步右侧详情；移动端仅在详情已打开时刷新
    const detailPanel = $('#detail-panel');
    const isDesktop = window.matchMedia('(min-width: 801px)').matches;
    if (isDesktop || (detailPanel && detailPanel.classList.contains('open'))) {
      showDetail(poi);
    }

    const listItem = $(`.poi-item[data-id="${poi.id}"]`);
    if (listItem) listItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function focusAncientPin(poi) {
    const pin = $(`.ancient-pin[data-id="${poi.id}"]`);
    if (!pin) return;

    $$('.ancient-pin').forEach(p => p.classList.remove('focused'));
    pin.classList.add('focused');

    const viewport = $('#ancient-viewport');
    const inner = $('#ancient-inner');
    if (!viewport || !inner) return;

    const vr = viewport.getBoundingClientRect();
    const pr = pin.getBoundingClientRect();
    const dx = (vr.left + vr.width / 2) - (pr.left + pr.width / 2);
    const dy = (vr.top + vr.height / 2) - (pr.top + pr.height / 2);

    ancientPan.x += dx;
    ancientPan.y += dy;
    if (ancientZoom < getAncientDefaultZoom(currentCity)) {
      ancientZoom = getAncientDefaultZoom(currentCity);
    }
    applyAncientTransform();
  }

  function showBottomSheet(poi) {
    const thumb = $('#sheet-thumb');
    thumb.onerror = function () { this.onerror = null; this.src = assetUrl('image/thumbs/brand-logo.jpg'); };
    thumb.src = poiThumb(poi);
    thumb.alt = poi.name;
    $('#sheet-name').textContent = poi.name;
    $('#sheet-rating').textContent = poi.rating;
    $('#sheet-tags').innerHTML = poi.tags.map(t => {
      const cls = t.includes('城市更新') ? 'tag renewal' : 'tag';
      return `<span class="${cls}">${t}</span>`;
    }).join('');
    $('#sheet-address').innerHTML = `<span>${poi.address}</span>`;
    $('#sheet-intro').textContent = poi.intro;
    $('#bottom-sheet').classList.add('open');
    highlightPoiInList(poi.id);
  }

  function closeBottomSheet() {
    $('#bottom-sheet').classList.remove('open');
    selectedPoi = null;
    highlightPoiInList(null);
    highlightMapPin(null);
  }

  function renderPoiList() {
    const list = $('#poi-list');
    if (!list) return;
    const pois = getFilteredPois();
    list.innerHTML = pois.map((poi, idx) => {
      const isRenewal = poi.category === 'renewal';
      return `
        <div class="poi-item" data-id="${poi.id}">
          ${safeImg(poiThumb(poi), poiFull(poi), poi.name, 'poi-item-thumb')}
          <div class="poi-item-body">
            <div class="poi-item-title">
              <span class="idx ${isRenewal ? 'renewal' : ''}">${getPoiDisplayIndex(poi.id, currentCity)}</span>
              <span>${poi.name}</span>
            </div>
            <div class="poi-item-addr">${poi.address}</div>
            <div class="poi-item-tags">
              ${poi.tags.map(t => `<span class="tag ${t.includes('城市更新') ? 'renewal' : ''}">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.poi-item').forEach(item => {
      item.addEventListener('click', () => {
        const poi = SONG_POIS[currentCity].pois.find(p => p.id === item.dataset.id);
        if (poi) selectPoi(poi);
      });
    });
  }

  function highlightPoiInList(id) {
    $$('.poi-item').forEach(item => {
      item.classList.toggle('active', !!id && item.dataset.id === id);
    });
  }

  function showDetail(poi) {
    if (!poi) poi = selectedPoi;
    if (!poi) return;
    const hero = $('#detail-hero-img');
    hero.onerror = function () { this.onerror = null; this.src = poiThumb(poi); };
    hero.src = poiFull(poi);
    $('#detail-hero-title').textContent = poi.name;
    $('#detail-meta').innerHTML = `
      <span class="sheet-rating">★ ${poi.rating}</span>
      ${poi.tags.map(t => `<span class="tag ${t.includes('城市更新') ? 'renewal' : ''}">${t}</span>`).join('')}
      <span style="font-size:12px;color:#999;">${poi.address}</span>
    `;
    $('#detail-intro').textContent = poi.intro;
    $('#detail-guide').textContent = poi.guide;

    const cultureSection = $('#detail-culture-section');
    if (poi.culture) {
      cultureSection.style.display = 'block';
      $('#detail-culture').textContent = poi.culture;
    } else {
      cultureSection.style.display = 'none';
    }

    const travelSection = $('#detail-travel-section');
    if (poi.travel) {
      travelSection.style.display = 'block';
      $('#detail-travel').textContent = poi.travel;
    } else {
      travelSection.style.display = 'none';
    }

    const renewalSection = $('#detail-renewal-section');
    if (poi.urbanRenewal) {
      renewalSection.style.display = 'block';
      $('#detail-renewal').textContent = poi.urbanRenewal;
    } else {
      renewalSection.style.display = 'none';
    }
    $('#detail-panel').classList.add('open');
  }

  function closeDetail() {
    $('#detail-panel').classList.remove('open');
  }

  /* ---------- 城市 / 筛选 ---------- */
  function switchCity(city) {
    currentCity = city;
    closeBottomSheet();
    closeDetail();
    $$('.city-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.city === city));
    $('#search-input').placeholder = `搜索${SONG_POIS[city].name}宋文化景点`;

    if (mapMode === 'ancient') {
      renderAncientMap();
    } else if (map) {
      mapLocateCity();
      renderMarkers();
    }
    updateFilterCounts();
    renderPoiList();
  }

  function setFilter(filter) {
    currentFilter = filter;
    $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === filter));
    closeBottomSheet();
    if (mapMode === 'ancient') renderAncientMap();
    else if (map) renderMarkers();
    renderPoiList();
  }

  function updateFilterCounts() {
    const cityData = SONG_POIS[currentCity];
    $('#count-all').textContent = cityData.pois.length;
    $('#count-song').textContent = cityData.pois.filter(p => p.category === 'song').length;
    $('#count-renewal').textContent = cityData.pois.filter(p => p.category === 'renewal').length;
  }

  /* ---------- 搜索 ---------- */
  function collectAllPois() {
    const all = [];
    Object.entries(SONG_POIS).forEach(([cityKey, cityData]) => {
      cityData.pois.forEach(poi => all.push({ ...poi, cityKey, cityName: cityData.name }));
    });
    return all;
  }

  function matchPois(keyword) {
    const kw = (keyword || '').trim().toLowerCase();
    const all = collectAllPois();
    if (!kw) return all.filter(p => p.cityKey === currentCity);
    return all.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.address.toLowerCase().includes(kw) ||
      p.intro.toLowerCase().includes(kw) ||
      p.tags.some(t => t.toLowerCase().includes(kw)) ||
      p.cityName.includes(kw)
    );
  }

  function updateSearchClear(value) {
    const btn = $('#search-clear');
    if (btn) btn.hidden = !(value && value.trim());
  }

  function showSearchDropdown(keyword) {
    const dropdown = $('#search-dropdown');
    if (!dropdown) return;

    const matched = matchPois(keyword);
    dropdown.hidden = false;

    if (matched.length === 0) {
      dropdown.innerHTML = '<div class="search-empty">未找到相关景点</div>';
      return;
    }

    dropdown.innerHTML = matched.slice(0, 12).map(p => {
      const num = getPoiDisplayIndex(p.id, p.cityKey);
      return `
        <div class="search-item" data-id="${p.id}" data-city="${p.cityKey}" role="option">
          ${safeImg(poiThumb(p), poiFull(p), p.name, 'search-item-thumb')}
          <div class="search-item-info">
            <div class="search-item-name"><span class="search-item-num">${num}</span>${p.name}</div>
            <div class="search-item-addr">${p.cityName} · ${p.address}</div>
          </div>
        </div>
      `;
    }).join('');

    dropdown.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        locateFromSearch(item.dataset.city, item.dataset.id);
      });
    });
  }

  function hideSearchDropdown() {
    const dropdown = $('#search-dropdown');
    if (dropdown) {
      dropdown.hidden = true;
      dropdown.innerHTML = '';
    }
  }

  function locateFromSearch(city, id) {
    const needSwitch = city !== currentCity;
    const input = $('#search-input');
    const poiName = SONG_POIS[city].pois.find(p => p.id === id)?.name || '';

    if (input) {
      input.value = poiName;
      updateSearchClear(poiName);
    }
    hideSearchDropdown();
    closeSearch();

    if (needSwitch) switchCity(city);

    const delay = needSwitch ? 450 : 0;
    setTimeout(() => {
      const poi = SONG_POIS[city].pois.find(p => p.id === id);
      if (poi) selectPoi(poi, { zoom: 16 });
    }, delay);
  }

  function openSearch() {
    $('#search-panel').classList.add('open');
    $('#search-panel-input').value = $('#search-input')?.value || '';
    $('#search-panel-input').focus();
    renderSearchResults($('#search-panel-input').value);
  }

  function closeSearch() {
    $('#search-panel').classList.remove('open');
    $('#search-panel-input').value = '';
  }

  function renderSearchResults(keyword) {
    const results = $('#search-results');
    if (!results) return;
    const matched = matchPois(keyword);

    if (matched.length === 0) {
      results.innerHTML = '<div class="search-empty">未找到相关景点</div>';
      return;
    }

    results.innerHTML = matched.map(p => `
      <div class="search-item" data-id="${p.id}" data-city="${p.cityKey}">
        ${safeImg(poiThumb(p), poiFull(p), p.name, 'search-item-thumb')}
        <div class="search-item-info">
          <div class="search-item-name">${p.name}</div>
          <div class="search-item-addr">${p.cityName} · ${p.address}</div>
        </div>
      </div>
    `).join('');

    results.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        locateFromSearch(item.dataset.city, item.dataset.id);
      });
    });
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    $$('.city-tab').forEach(tab => tab.addEventListener('click', () => switchCity(tab.dataset.city)));
    $$('.chip').forEach(chip => chip.addEventListener('click', () => setFilter(chip.dataset.filter)));
    $$('.mode-tab').forEach(tab => tab.addEventListener('click', () => setMapMode(tab.dataset.mode)));

    $('#btn-map-mode').addEventListener('click', () => {
      setMapMode(mapMode === 'modern' ? 'ancient' : 'modern');
    });

    $('#sheet-close').addEventListener('click', closeBottomSheet);
    $('#btn-guide').addEventListener('click', () => showDetail());
    $('#btn-nav').addEventListener('click', () => {
      if (!selectedPoi) return;
      if (mapMode === 'modern' && map) {
        mapSetView(selectedPoi.lng, selectedPoi.lat, 16);
      } else if (mapMode === 'ancient') {
        focusAncientPin(selectedPoi);
      }
    });

    $('#detail-back').addEventListener('click', closeDetail);

    const searchInput = $('#search-input');
    searchInput.addEventListener('focus', () => {
      showSearchDropdown(searchInput.value);
    });
    searchInput.addEventListener('input', (e) => {
      updateSearchClear(e.target.value);
      showSearchDropdown(e.target.value);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideSearchDropdown();
        searchInput.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const first = $('#search-dropdown .search-item');
        if (first) locateFromSearch(first.dataset.city, first.dataset.id);
      }
    });

    $('#search-clear').addEventListener('click', () => {
      searchInput.value = '';
      updateSearchClear('');
      hideSearchDropdown();
      searchInput.focus();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search')) hideSearchDropdown();
    });

    $('#search-cancel').addEventListener('click', closeSearch);
    $('#search-panel-input').addEventListener('input', (e) => renderSearchResults(e.target.value));

    $('#btn-locate').addEventListener('click', () => {
      if (mapMode === 'ancient') ancientResetView();
      else mapLocateCity();
    });

    $('#btn-zoom-in').addEventListener('click', () => {
      if (mapMode === 'ancient') ancientZoomIn();
      else mapZoomIn();
    });

    $('#btn-zoom-out').addEventListener('click', () => {
      if (mapMode === 'ancient') ancientZoomOut();
      else mapZoomOut();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
