(function() {
  'use strict';

  let mapInstance = null;
  let isInitializing = false;

  const TILE_SIZE = 256;
  // Tile dirs 0–5 correspond to Leaflet zoom -5..0 (zoomOffset = 5).
  const TILE_ZOOM_OFFSET = 5;

  const MAP_CONFIGS = {
    'world-map': {
      id: 'world-map',
      tileDir: 'eldoria',
      width: 6336,
      height: 2688,
      initialCenter: [3168, 1344],
      initialZoom: -1.6,
      hasPins: true
    },
    'summer-isles-map': {
      id: 'summer-isles-map',
      tileDir: 'summer-isles',
      width: 5760,
      height: 2944,
      initialZoom: -1
    }
  };

  // CRS.Simple flips the y-axis: project(LatLng(lat,lng)) = Point(lng, -lat).
  // This means Leaflet requests tile y-indices that are negative (e.g. -11 to -1
  // for a map with 11 tile rows). Our files use y=0 (top) to y=N-1 (bottom).
  // We extend L.TileLayer to remap: fileY = coords.y + numTilesY.
  const MapTileLayer = L.TileLayer.extend({
    getTileUrl: function(coords) {
      const cfg = this.options._cfg;
      // coords.z is the Leaflet zoom (already clamped by maxNativeZoom if set).
      // URL dir z is the Leaflet zoom shifted by the offset.
      const urlZ = coords.z + TILE_ZOOM_OFFSET;
      // At this Leaflet zoom, how many tile rows does the image span?
      const scale = Math.pow(2, coords.z);
      const numTilesY = Math.ceil(Math.round(cfg.height * scale) / TILE_SIZE);
      // Remap negative Leaflet y to 0-based file y.
      const fileY = coords.y + numTilesY;
      return `/static/tiles/${cfg.tileDir}/${urlZ}/${coords.x}/${fileY}.png`;
    }
  });

  function getGeometry(cfg) {
    const tileHeight = Math.ceil(cfg.height / TILE_SIZE) * TILE_SIZE;
    const bottomPadding = tileHeight - cfg.height;

    return {
      // Keep the complete image visible while excluding generated bottom padding.
      bounds: L.latLngBounds([bottomPadding, 0], [tileHeight, cfg.width]),
      // Convert ordinary top-left image pixels to CRS.Simple coordinates.
      imagePoint: ([x, y]) => L.latLng(tileHeight - y, x),
    };
  }

  function cleanup() {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
    document.querySelectorAll('.leaflet-container').forEach(el => {
      el.classList.remove('leaflet-container', 'leaflet-touch', 'leaflet-fade-anim');
      el.innerHTML = '';
      el._leaflet_id = undefined;
    });
  }

  async function initMap() {
    const activeConfig = Object.values(MAP_CONFIGS).find(cfg => document.getElementById(cfg.id));

    if (!activeConfig || typeof L === 'undefined' || isInitializing) return;

    isInitializing = true;
    cleanup();

    try {
      const geometry = getGeometry(activeConfig);

      mapInstance = L.map(activeConfig.id, {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 2,
        zoomSnap: 0.1,
        attributionControl: false
      });

      new MapTileLayer('', {
        tileSize: TILE_SIZE,
        zoomOffset: TILE_ZOOM_OFFSET,
        // Must match the map's zoom range — GridLayer defaults minZoom to 0,
        // which silently skips tile loading at any negative zoom level.
        minZoom: -5,
        maxZoom: 2,
        // Tiles exist for Leaflet zoom -5..0 (URL z=0..5).
        // For zoom 1-2, Leaflet scales up the zoom-0 tiles.
        maxNativeZoom: 0,
        noWrap: true,
        bounds: geometry.bounds,
        _cfg: activeConfig
      }).addTo(mapInstance);

      mapInstance.setMaxBounds(geometry.bounds);

      if (activeConfig.id === 'world-map') {
        const islandCoords = geometry.imagePoint([2928, 1313]);
        const zoomIcon = L.divIcon({
          className: 'region-pin',
          html: '<span>🔍</span>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -22]
        });
        const marker = L.marker(islandCoords, { icon: zoomIcon }).addTo(mapInstance);
        marker.bindPopup('<b>The Summer Isles</b><br><a href="/Settings/Regions/The-Summer-Isles/the-summer-isles">Enter Region →</a>');
        mapInstance.setView(geometry.imagePoint(activeConfig.initialCenter), activeConfig.initialZoom);
      } else {
        mapInstance.fitBounds(geometry.bounds);
      }

      setTimeout(() => mapInstance?.invalidateSize(), 50);
    } catch (e) {
      console.error("Map Init Error:", e);
    } finally {
      isInitializing = false;
    }
  }

  document.addEventListener('nav', () => {
    cleanup();
    setTimeout(initMap, 100);
  });

  if (document.readyState === 'complete') {
    initMap();
  } else {
    window.addEventListener('load', initMap);
  }
})();
