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
import {initMap, includeScript, fromGeopoint, createMarker} from './utils';

export default {
  name: 'GeopointView',
  props: ['value'],
  components: {VFlex},
  computed: {
    geopoint() {
      return fromGeopoint(this.value);
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
      const {map, marker} = initMap(this.geopoint.latitude, this.geopoint.longitude, {
        title: `ID: ${this.geopoint.geonamesid}`,
      });
      this.map = map;
      this.marker = marker;
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
