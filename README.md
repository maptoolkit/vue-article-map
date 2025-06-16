# `ArticleMap` – Interactive Map Component – **[Live Demo](https://maptoolkit.github.io/vue-article-map/)**

A Vue 3 component that uses [`@maptoolkit/maps-sdk`](https://github.com/maptoolkit/maptoolkit-js/pkgs/npm/maps-sdk) to display an interactive map from GeoJSON data. It supports hover and selection interactions, custom popups, and flexible layer styling.

## Installation & Quick Start

### 1. Configure npm registry

Set the npm registry for the Maptoolkit scope:

```bash
npm config set @maptoolkit:registry https://npm.pkg.github.com/
```

### 2. Install the package

```bash
npm install @maptoolkit/vue-article-map
```

### 4. Import and use the component

Import the component and its styles in your project:

```typescript
import ArticleMap from "@maptoolkit/vue-article-map";
import "@maptoolkit/vue-article-map/css";
```

Add the component to your template:

```html
<ArticleMap
  v-model:hoveredFeature="hoveredFeature"
  v-model:selectedFeature="selectedFeature"
  :geojson="geoJsonData"
  :mapOptions="{ apiKey: 'your-api-key' }"
  :options="{
    popup: (feature) => `<b>${feature.properties?.title}</b>`,
  }"
/>
```

Replace `maptoolkit-api-key` with your actual Maptoolkit Maps API key and provide your GeoJSON data via the `geoJsonData` variable.

## Props

| Name                          | Type       | Required | Description                                                                                                                                      |
| ----------------------------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `geojson`                     | `Object`   | Yes      | A valid GeoJSON object. Features should have an `id` for interactive functionality. The map updates automatically when this prop changes.        |
| `mapOptions`                  | `Object`   | No       | Options for initializing the map (extends [MapLibre GL JS MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/)).   |
| `options`                     | `Object`   | No       | Object for customizing component behavior and styles.                                                                                            |
| `options.line`                | `Object`   | -        | Style overrides for the `line` layer, used with `LineString` and `MultiLineString` geometries.                                                   |
| `options.line.default.layout` | `Object`   | -        | Layout properties for the `line` layer in its default state.                                                                                     |
| `options.line.default.paint`  | `Object`   | -        | Paint properties for the `line` layer in its default state.                                                                                      |
| `options.icon`                | `Object`   | -        | Style overrides for the `symbol` layer, used with `Point` geometries.                                                                            |
| `options.icon.default.layout` | `Object`   | -        | Layout properties for the `symbol` layer in its default state.                                                                                   |
| `options.icon.default.paint`  | `Object`   | -        | Paint properties for the `symbol` layer in its default state.                                                                                    |
| `options.icon.hover.layout`   | `Object`   | -        | Layout properties for the `symbol` layer when a feature is hovered.                                                                              |
| `options.icon.hover.paint`    | `Object`   | -        | Paint properties for the `symbol` layer when a feature is hovered.                                                                               |
| `options.icon.select.layout`  | `Object`   | -        | Layout properties for the `symbol` layer when a feature is selected.                                                                             |
| `options.icon.select.paint`   | `Object`   | -        | Paint properties for the `symbol` layer when a feature is selected.                                                                              |
| `options.popup`               | `Object`   | -        | Object for customizing popup.                                                                                                                    |
| `options.popup.options`       | `Object`   | -        | Options for initializing the popup (see [MapLibre GL JS PopupOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/PopupOptions/)). |
| `options.popup.content`       | `Function` | -        | Function to generate popup content for a feature. Can return an HTML string, DOM Node, or a Promise resolving to either. Called on hover.        |

---

## Bindings

| Model             | Type                     | Description                    |
| ----------------- | ------------------------ | ------------------------------ |
| `hoveredFeature`  | `GeoJSONFeature \| null` | The currently hovered feature  |
| `selectedFeature` | `GeoJSONFeature \| null` | The currently selected feature |

---

## Exposed

| Name  | Type  | Description                         |
| ----- | ----- | ----------------------------------- |
| `map` | `Map` | Access to the underlying map object |

Access via `ref`:

```typescript
const mapRef = ref();
mapRef.value.map.flyTo({ zoom: 10 });
```
