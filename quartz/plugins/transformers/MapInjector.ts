import { QuartzTransformerPlugin } from "../types"

export const MapInjector: QuartzTransformerPlugin = () => {
  return {
    name: "MapInjector",

    externalResources() {
      return {
        css: [
          {
            // Quartz supports css entries with { content: "https://..." }
            content: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
          },
        ],
        js: [
          {
            src: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
            loadTime: "afterDOMReady",
            contentType: "external",
            spaPreserve: true,
          },
          {
            // quartz/static/js/map-init.js will be served at /static/js/map-init.js
            src: "/static/js/map-init.js",
            loadTime: "afterDOMReady",
            contentType: "external",
            spaPreserve: true,
          },
        ],
      }
    },

    textTransform(_ctx, src) {
      const html = src.toString()

      // Recommended usage in markdown:
      // <div id="map-root" data-map="world"></div>
      // <div id="map-root" data-map="summer-isles"></div>
      const withWorld = html.replace(
        /<div\s+id=["']map-root["']\s+data-map=["']world["']\s*>\s*<\/div>/gi,
        `<div id="world-map" class="quartz-map"></div>`,
      )

      const withSummer = withWorld.replace(
        /<div\s+id=["']map-root["']\s+data-map=["']summer-isles["']\s*>\s*<\/div>/gi,
        `<div id="summer-isles-map" class="quartz-map"></div>`,
      )

      // Back-compat: <div id="map-root"></div> -> world map
      return withSummer.replace(
        /<div\s+id=["']map-root["']\s*>\s*<\/div>/gi,
        `<div id="world-map" class="quartz-map"></div>`,
      )
    },
  }
}
