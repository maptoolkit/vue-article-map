import { Map, type MapOptions, type SymbolLayerSpecification, type LineLayerSpecification, type PopupOptions } from "@maptoolkit/maps-sdk";
import * as geojson from "geojson";

export type ArticleMapGeojsonFeature = geojson.Feature & {
  id: string | number;
  geometry: geojson.Point | geojson.LineString | geojson.MultiLineString;
};
export type ArticleMapGeojson = geojson.FeatureCollection & {
  features: ArticleMapGeojsonFeature[];
};

export type ArticleMapComponent = {
  map: Map;
};

export type ArticleMapOptions = {
  icon?: {
    default?: Pick<SymbolLayerSpecification, "layout" | "paint">;
    hover?: Pick<SymbolLayerSpecification, "layout" | "paint">;
    select?: Pick<SymbolLayerSpecification, "layout" | "paint">;
  };
  line?: {
    default?: Pick<LineLayerSpecification, "layout" | "paint">;
  };
  popup?: {
    options?: PopupOptions;
    content?: (feature: ArticleMapGeojsonFeature) => string | Node | Promise<string | Node>;
  };
};

export type ArticleMapComponentProps = {
  mapOptions?: MapOptions;
  options?: ArticleMapOptions;
  geojson?: ArticleMapGeojson;
  hoveredFeature?: ArticleMapGeojsonFeature | null;
  selectedFeature?: ArticleMapGeojsonFeature | null;
};
