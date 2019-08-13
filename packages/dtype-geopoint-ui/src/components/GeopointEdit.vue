<template>
  <v-flex xs12 v-if="value.geonamesid === 0">
    <div id="map"></div>
  </v-flex>
  <v-flex xs12 v-else>
    <iframe height="400" width="100%" :src="`https://www.geonames.org/${value.geonamesid}`" frameborder="0"></iframe>
  </v-flex>
</template>

<script>
import {VFlex} from 'vuetify/lib';
import {initMap, includeScript, fromGeopoint, toGeopoint, createMarker} from './utils';

export default {
  name: 'GeopointEdit',
  props: ['value'],
  components: {VFlex},
  data() {
    return {map: null, marker: null, dataSet: false};
  },
  computed: {
    geopoint() {
      return fromGeopoint(this.value);
    },
    markerOpts() {
      let markerOpts = {};
      if (!this.geopoint.geonamesid) {
        markerOpts = {
          draggable: true,
          title: `ID: ${this.geopoint.geonamesid}`,
        }
      }
      return markerOpts;
    },
  },
  mounted() {
    if (this.value.geonamesid) return;
    this.setData();
  },
  watch: {
    value() {
      if (this.value.geonamesid) {
        this.dataSet = false;
        return;
      }
      if (!this.dataSet) {
        this.setData();
      }

      this.marker.setMap(null);
      this.marker = null;
      this.marker = createMarker(
        this.map,
        {lat: this.geopoint.latitude, lng: this.geopoint.longitude},
        this.markerOpts,
      );
      this.map.panTo(this.marker.getPosition());
    },
  },
  methods: {
    setData() {
      includeScript();
      setTimeout(this.setMap, 1000);
    },
    setMap() {
      this.dataSet = true;
      const {map, marker} = initMap(this.geopoint.latitude, this.geopoint.longitude, this.markerOpts);
      this.map = map;
      this.marker = marker;

      if (!this.geopoint.geonamesid) {
        this.setMarkerEvents();
      }
    },
    setMarkerEvents() {
      this.marker.addListener('dragend', () => {
        this.geopointChanged();
      });
    },
    geopointChanged() {
      const position = this.marker.getPosition();
      const newgeopoint = Object.assign({}, this.value, {
        latitude: position.lat(),
        longitude: position.lng(),
      });

      this.$emit('input', toGeopoint(newgeopoint));
    },
  },
};
</script>

<style>
  #map {
    width: 100%;
    height: 400px;
    background-color: grey;
  }
</style>
