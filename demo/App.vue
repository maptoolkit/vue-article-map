<script setup>
import ArticleMap from "../src/export.ts";
import { ref, watch } from "vue";
import features from "./features.json";

const mapOptions = {
  apiKey: import.meta.env.VITE_MAPTOOLKIT_APIKEY,
};

const articleMapOptions = {
  popup: {
    options: { offset: [0, -34] },
    content: (feature) => feature.properties?.name,
  },
};

const articleMap = ref(null);
const listItems = ref(null);

const geojson = ref(features);

const hoveredFeature = ref(null);
const selectedFeature = ref(null);

watch(selectedFeature, (feature) => {
  if (feature) {
    for (const li of listItems.value) {
      if (li.dataset.id == feature.id) {
        li.scrollIntoViewIfNeeded();
        break;
      }
    }
  }
});

function onListItemCick(feature) {
  selectedFeature.value = selectedFeature.value?.id == feature?.id ? null : feature;

  if (selectedFeature.value) {
    articleMap.value.map.flyTo({
      center: feature.geometry.coordinates,
      zoom: Math.max(articleMap.value.map.getZoom(), 17),
    });
  }
}
</script>

<template>
  <main>
    <ArticleMap
      ref="articleMap"
      class="map"
      :map-options="mapOptions"
      :geojson="geojson"
      :options="articleMapOptions"
      v-model:hovered-feature="hoveredFeature"
      v-model:selected-feature="selectedFeature"
    />
    <ul class="list">
      <li
        ref="listItems"
        :data-id="feature.id"
        v-for="feature in geojson.features.filter((f) => f.geometry.type === 'Point')"
        :class="{ hover: feature.id == hoveredFeature?.id, select: feature.id == selectedFeature?.id }"
        @mouseover="hoveredFeature = feature"
        @mouseout="hoveredFeature = null"
        @click="onListItemCick(feature)"
      >
        {{ feature.properties?.name }}<br />
        <small>{{ feature.properties?.category }}</small>
      </li>
    </ul>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: row;
  height: 720px;
  font-family: Arial, Helvetica, sans-serif;
}

.map {
  flex: 1;
  height: 100%;
}

.list {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0 10px;
  height: 100%;
  overflow: auto;
}

.list > li {
  padding: 15px 20px;
  border-left: 1px solid #e1e1e1;
  cursor: pointer;
}

.list > li.hover {
  border-left-color: #fa3f38;
}

.list > li.select {
  border-left-width: 3px;
  border-left-color: #fa3f38;
}

.map :deep(.maplibregl-popup-content) {
  padding: 3px 10px;
  text-align: center;
  pointer-events: none;
}
.map :deep(.maplibregl-popup-tip) {
  border-width: 4px;
}
</style>
