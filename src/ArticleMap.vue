<script setup lang="ts">
import * as maptoolkit from "@maptoolkit/maps-sdk";
import { type Ref, ref, provide, watch, onMounted, type ModelRef } from "vue";
import type { ArticleMapComponentProps, ArticleMapGeojsonFeature } from "./types.js";

const props = defineProps<ArticleMapComponentProps>();

const hoveredFeature: ModelRef<ArticleMapComponentProps["hoveredFeature"]> = defineModel<ArticleMapComponentProps["hoveredFeature"]>("hoveredFeature", {
  default: null,
});
const selectedFeature: ModelRef<ArticleMapComponentProps["hoveredFeature"]> = defineModel<ArticleMapComponentProps["hoveredFeature"]>("selectedFeature", {
  default: null,
});

const idPrefix = "maptoolkit_article_map_";
const sourceName = `${idPrefix}geojson`;

const mapOptions: maptoolkit.MapOptions = {};
const isMapReady: Ref<boolean> = ref(false);

const container: Ref<HTMLElement | null> = ref(null);

// Calculate GeoJSON bounds for initial view
if (props.geojson?.features && !props.mapOptions?.center) {
  const bounds = new maptoolkit.LngLatBounds();

  const extendBounds = (coordinates: any) => {
    if (Array.isArray(coordinates[0])) {
      coordinates.forEach(extendBounds);
    } else {
      bounds.extend(coordinates as maptoolkit.LngLatLike);
    }
  };

  for (const feature of props.geojson?.features) {
    extendBounds(feature.geometry.coordinates);
  }

  if (!bounds.isEmpty()) {
    mapOptions.bounds = bounds;
  }
}

const map: maptoolkit.Map = new maptoolkit.Map(Object.assign(mapOptions, props.mapOptions));
const navigationCtrl = new maptoolkit.NavigationControl({ compassControl: false, pitchControl: false, terrainControl: false });

function setupSource(): void {
  const source: maptoolkit.Source | undefined = map.getSource(sourceName);

  if (!source) {
    map.addSource(sourceName, {
      type: "geojson",
      data: props.geojson as any,
    });
  }
}

function updateSource(): void {
  const source: (ReturnType<typeof map.getSource> & { setData: (data: any) => void }) | undefined = map.getSource(sourceName);

  if (source) {
    source.setData(props.geojson as any);
  }
}

function setupLayers(): void {
  map.addLayer({
    id: `${idPrefix}_lines`,
    source: sourceName,
    filter: ["in", ["geometry-type"], "LineString"],
    type: "line",
    layout: Object.assign(
      {
        "line-cap": "round",
        "line-join": "round",
      },
      props.options?.line?.default?.layout,
    ),
    paint: Object.assign(
      {
        "line-width": 4,
        "line-color": "#fa3f38",
      },
      props.options?.line?.default?.paint,
    ),
  });

  map.addLayer({
    id: `${idPrefix}_points`,
    source: sourceName,
    filter: ["in", ["geometry-type"], "Point"],
    type: "symbol",
    layout: Object.assign(
      {
        "icon-image": "marker-darkblue",
        "icon-anchor": "bottom",
        "icon-size": 0.8,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      props.options?.icon?.default?.layout,
    ),
    paint: Object.assign(
      {
        "icon-opacity": ["case", ["any", ["boolean", ["feature-state", "hover"], false], ["boolean", ["feature-state", "select"], false]], 0.0001, 1],
      },
      props.options?.icon?.default?.paint,
    ),
  });

  map.addLayer({
    id: `${idPrefix}_points_hover`,
    source: sourceName,
    filter: ["in", ["geometry-type"], "Point"],
    type: "symbol",
    layout: Object.assign(
      {
        "icon-image": "marker-darkblue",
        "icon-anchor": "bottom",
        "icon-size": 0.9,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      props.options?.icon?.hover?.layout,
    ),
    paint: Object.assign(
      {
        "icon-opacity": ["case", ["all", ["boolean", ["feature-state", "hover"], false], ["!", ["boolean", ["feature-state", "select"], false]]], 1, 0.0001],
      },
      props.options?.icon?.hover?.paint,
    ),
  });

  map.addLayer({
    id: `${idPrefix}_points_select`,
    source: sourceName,
    filter: ["in", ["geometry-type"], "Point"],
    type: "symbol",
    layout: Object.assign(
      {
        "icon-image": "marker-orange",
        "icon-anchor": "bottom",
        "icon-size": 1,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      props.options?.icon?.select?.layout,
    ),
    paint: Object.assign(
      {
        "icon-opacity": ["case", ["boolean", ["feature-state", "select"], false], 1, 0.0001],
      },
      props.options?.icon?.select?.paint,
    ),
  });
}

function getFeaturesAtPoint(point: maptoolkit.MapLayerMouseEvent["point"] | maptoolkit.MapLayerTouchEvent["point"]): ArticleMapGeojsonFeature[] {
  const features = map.queryRenderedFeatures(point, { layers: [`${idPrefix}_points`] });

  return features.filter((f) => f.layer.type === "symbol") as ArticleMapGeojsonFeature[];
}

const popupOptions: maptoolkit.PopupOptions = Object.assign({ closeButton: false, className: "maptoolkit-v-map-popup" }, props.options?.popup?.options);
const popup: InstanceType<typeof maptoolkit.Popup> = new maptoolkit.Popup(popupOptions);

function setPopupContent(content: string | Node): void {
  if (typeof content === "string") {
    popup.setHTML(content);
  } else if (content instanceof Node) {
    popup.setDOMContent(content);
  }
}

function setFeatureStates(featureId: maptoolkit.FeatureIdentifier["id"], state: string): void {
  if (props.geojson?.features) {
    for (const feature of props.geojson.features) {
      const newValue: boolean = featureId == feature.id;
      const currentValue: boolean = map.getFeatureState({ id: feature.id, source: sourceName })[state] || false;

      if (newValue !== currentValue) {
        map.setFeatureState({ id: feature.id, source: sourceName }, { [state]: newValue });
      }
    }
  }
}

async function onMouseMove(ev: maptoolkit.MapLayerMouseEvent | maptoolkit.MapLayerTouchEvent): Promise<void> {
  const feature: ArticleMapGeojsonFeature | undefined = getFeaturesAtPoint(ev.point)[0];
  const canvasContainer: HTMLElement = ev.target.getCanvasContainer();

  if (feature?.id != hoveredFeature.value?.id) {
    hoveredFeature.value = feature || null;
  }

  if (feature) {
    canvasContainer.style.cursor = "pointer";

    if (typeof props.options?.popup?.content === "function") {
      const popupContent = props.options.popup.content(feature);

      popup.setLngLat((feature.geometry as any).coordinates);

      if (popupContent instanceof Promise) {
        setPopupContent(await popupContent);
      } else {
        setPopupContent(popupContent);
      }
      console.log(popup._map);
      if (!popup._map) {
        popup.addTo(map);
      }
    }
  } else {
    canvasContainer.style.cursor = "";

    if (popup._map) {
      popup.remove();
    }
  }
}

function onClick(ev: maptoolkit.MapLayerMouseEvent | maptoolkit.MapLayerTouchEvent): void {
  const feature: ArticleMapGeojsonFeature | undefined = getFeaturesAtPoint(ev.point)[0];

  if (feature?.id != selectedFeature.value?.id) {
    selectedFeature.value = feature || null;
  }
}

// Update GeoJSON source if prop changes
watch(
  () => props.geojson,
  () => updateSource(),
  { deep: true },
);

// Apply feature states for model changes
watch(hoveredFeature, (feature) => {
  if (isMapReady.value) {
    setFeatureStates(feature?.id, "hover");
  }
});
watch(selectedFeature, (feature) => {
  if (isMapReady.value) {
    setFeatureStates(feature?.id, "select");
    console.log("select");
  }
});

map.once("style.load", () => {
  // Add navigation control
  map.addControl(navigationCtrl, "top-right");

  // Add source for passed GeoJSON
  if (props.geojson) {
    setupSource();
    setupLayers();

    // Add event listeners for feature hover and select
    map.on("mousemove", onMouseMove);
    map.on("click", onClick);
  }

  isMapReady.value = true;
});

onMounted(() => {
  if (container.value) {
    map.setContainer(container.value);
  }
});

provide("map", map);
defineExpose({ map });
</script>

<template>
  <div ref="container" class="maptoolkit-v-map"></div>
</template>

<style>
@import "@maptoolkit/maps-sdk/css";
</style>
