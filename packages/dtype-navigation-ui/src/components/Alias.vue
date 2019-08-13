<template>
  <v-container style="margin:5px;max-width: 100%;">
    <v-layout row wrap>
      <v-flex xs12>
        <AliasSelector
          :initial="viewer ? domain : null"
          :linkbtn="viewer ? false : true"
          @alias="setAlias"
        />
      </v-flex>
      <v-layout row wrap justify-end>
        <v-flex shrink>
          <v-btn icon v-if="!viewer">
            <v-icon @click="saveResource">fa-save</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon v-if="viewer" @click="viewer = false">fa-edit</v-icon>
            <v-icon v-else @click="viewer = true">fa-eye</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-flex xs12>
        <component
          :is="dynamicComponent"
          v-model="dynamicComponentData"
          :dtypeAbi="dtypeAbi"
          :addition="selectedAlias"
          :getAliasData="getAliasData"
          @save="saveResource"
        ></component>
      </v-flex>
    </v-layout>
    <v-layout row wrap justify-end v-if="updateDialog">
      <v-flex shrink>
        <v-btn
          icon
          @click="saveResource(true, updateDialogdtypeData, updateDialogValue, updateDialogAliasData)"
        >
          <v-icon>fa-save</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs12>
        <component
          :is="updateDialogDynamicComponent"
          v-model="updateDialogValue"
          :dtypeAbi="updateDialogAbi"
          :getAliasData="getAliasData"
        ></component>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
// import Vue from 'vue';
import {mapState} from 'vuex';
import {getDataItemByTypeHash, buildStructAbi} from '@dtype/core';
import {DefaultEdit} from '@dtype/default-ui';
import {TYPE_PREVIEW, getUIPackage, getDynamicPackageInternal, setDynamicComponent} from '../utils.js';

import AliasSelector from './AliasSelector';

// http://192.168.1.140:8080/#/alias?alias=markdown.article1
// http://192.168.1.140:8080/#/alias?alias=markdown.article1

export default {
  name: 'Alias',
  props: ['query'],
  components: {
    AliasSelector,
    DefaultEdit,
  },
  data: () => ({
    viewer: true,
    domain: '',
    selectedAlias: null,
    aliasData: null,
    dtypeData: null,
    dtypeAbi: {},
    dynamicPackage: null,
    dynamicComponent: null,
    dynamicComponentData: null,
    updateDialogDynamicComponent: null,
    updateDialog: false,
    updateDialogValueAlias: null,
    updateDialogValue: null,
    updateDialogAliasData: null,
    updateDialogdtypeData: null,
    updateDialogAbi: null,
  }),
  computed: mapState('alias', {
    alias: 'alias',
  }),
  mounted() {
    if (this.query) {
      this.setAliasData(this.query.alias);
    }
    window.updateTypeData = async (alias) => {
      console.log('updateTypeData', alias);
      const {content, dtypeData} = await this.getAliasData(alias);
      this.updateDialogValue = content;
      this.updateDialogValueAlias = alias;
      this.updateDialogAliasData = content;
      this.updateDialogdtypeData = dtypeData;
      this.updateDialogAbi = await buildStructAbi(
        this.$store.state.dtype.contract,
        dtypeData.typeHash,
        dtypeData.name,
      );
      const {uiPackage, component} = await this.getDynamicPackageInternal(
        dtypeData.name,
        'edit',
      );
      this.updateDialogDynamicComponent = component.name;
      this.updateDialog = true;
    }
  },
  watch: {
    query() {
      if (this.query && this.alias) {
        this.setAliasData(this.query.alias);
      }
    },
    alias() {
      if (this.query && this.alias) {
        this.setAliasData(this.query.alias);
      }
    },
    selectedAlias() {
      if (this.viewer) {
        this.$router.push({path: 'alias', query: {alias: this.selectedAlias.alias}});
      }
    },
    viewer(oldviewer, newviewer) {
      if (!this.dynamicPackage) return;
      const component = setDynamicComponent(this.dynamicPackage, this.viewer ? 'view' : 'edit');
      this.dynamicComponent = component.name;
    },
    aliasData() {
      this.dynamicComponentData = this.aliasData;
    },
    dtypeData() {
      console.log('dtypeData', this.dtypeData);
      buildStructAbi(
        this.$store.state.dtype.contract,
        this.dtypeData.typeHash,
        this.dtypeData.name,
      ).then((abi) => {
        this.dtypeAbi = abi;
      });
    },
  },
  methods: {
    setAlias(alias) {
      this.selectedAlias = alias;
    },
    async setAliasData(url) {
      const {content, dtypeData} = await this.getAliasData(url);
      this.aliasData = content;
      this.dtypeData = dtypeData;
      this.setDynamicPackage();
    },
    async getAliasData(url) {
      this.domain = this.query.alias;
      // TODO: account for all separators & multiple subdomains
      // see replaceAlias commented code
      const parts = url.split('.');
      const dtypeData = await this.$store.dispatch('dtype/getTypeStruct', {lang: 0, name: parts[0]});

      const identifier = await this.$store.dispatch('alias/parseAlias', {
        dTypeIdentifier: dtypeData.typeHash,
        name: parts[1],
        separator: '.',
      });

      const content = await getDataItemByTypeHash(
        this.$store.state.dtype.contract,
        this.$store.state.dtype.wallet,
        dtypeData,
        identifier,
      );
      return {content, dtypeData};
    },
    saveResource(dataSet, dtypeData, data, aliasData) {
      console.log('saveResource', dataSet, dtypeData, data, aliasData, aliasData? aliasData.typeHash : null);
      this.$store.dispatch('alias/saveResource', {
        dTypeData: dataSet === true ? dtypeData : this.dtypeData,
        data: dataSet === true ? data : this.dynamicComponentData,
        identifier: dataSet === true ? aliasData.typeHash : this.aliasData.typeHash,
      }).then((newidentifier) => {
        console.log('newidentifier', newidentifier);
        if (dataSet) {
          this.changeAlias(newidentifier, this.updateDialogValueAlias, dtypeData);
        } else {
          this.changeAlias(newidentifier);
        }
        this.updateDialog = false;
      });
    },
    changeAlias(identifier, domain, dtypeData) {
      const parts = (domain || this.domain).split('.');
      this.$store.dispatch('alias/setAlias', {
        dTypeIdentifier: (dtypeData || this.dtypeData).typeHash,
        separator: '.',
        name: parts[1],
        identifier,
      });
    },
    parseContent(content) {
      if (content && this.dtypeData && TYPE_PREVIEW[this.dtypeData.name]) {
        return TYPE_PREVIEW[this.dtypeData.name](content);
      }
      return '';
    },
    async setDynamicPackage() {
      // let uiPackage = await getUIPackage(this.dtypeData.name);
      //
      // if (!uiPackage) {
      //   uiPackage = await getUIPackage('default');
      // }
      //
      // this.dynamicPackage = uiPackage;
      //
      // this.setDynamicComponent();

      const {uiPackage, component} = await this.getDynamicPackageInternal(
        this.dtypeData.name,
        this.viewer ? 'view' : 'edit',
      );
      this.dynamicPackage = uiPackage;
      this.dynamicComponent = component.name;
    },
    // setDynamicComponent() {
    //   const {getComponent} = this.dynamicPackage;
    //   const componentType = this.viewer ? 'view' : 'edit';
    //   const component = getComponent(componentType);
    //   console.log('componentName', component.name, component);
    //   Vue.component(component.name, component);
    //   this.dynamicComponent = component.name;
    // },
    async getDynamicPackageInternal(dtypeName, componentType) {
      // let uiPackage = await getUIPackage(dtypeName);
      //
      // if (!uiPackage) {
      //   uiPackage = await getUIPackage('default');
      // }
      //
      // const component = this.setDynamicComponent(uiPackage, componentType);
      //
      // return {uiPackage, component};
      return getDynamicPackageInternal(dtypeName, componentType);
    },
    // setDynamicComponent(uiPackage, componentType) {
    //   console.log('setDynamicComponent', uiPackage, componentType);
    //   const {getComponent} = uiPackage;
    //   const component = getComponent(componentType);
    //   console.log('componentName', component.name, component);
    //   Vue.component(component.name, component);
    //   return component;
    // },
  },
};
</script>
