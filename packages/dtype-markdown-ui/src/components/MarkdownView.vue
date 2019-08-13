<template>
  <v-layout row wrap>
    <v-flex xs12>
      <div v-html="innerHtml" class='subheading'></div>
    </v-flex>
  </v-layout>
</template>

<script>
import {VLayout, VFlex} from 'vuetify/lib';
import marked from 'marked';
import {
  TYPE_PREVIEW,
  typePreview,
  previewRender,
  getAliasesFromMd,
  replaceAliases,
} from '../utils.js';

export default {
  name: 'MarkdownView',
  props: ['value', 'getAliasData'],
  components: {VLayout, VFlex},
  data() {
    return {
      tempContent: '',
      aliascontent: {},
      innerHtml: '',
    };
  },
  mounted() {
    this.setData();
  },
  watch: {
    value() {
      this.setData();
    },
  },
  methods: {
    setData() {
      this.tempContent = this.value ? TYPE_PREVIEW.markdown(this.value) : '';
      this.aliascontent = {};
      this.updatePreview();
    },
    updatePreview() {
      // previewRender(this.tempContent, this.replaceAlias).then((text) => {
      //   // TODO sanitize html with something like https://github.com/cure53/DOMPurify
      //   document.getElementById('content').innerHTML = marked(text);
      // });
      // FIXME temporary
      let tempContent = this.tempContent;
      // const {links} = getAliasesFromMd(tempContent);
      // tempContent = replaceAliases(tempContent, links.full, links.aliases.map(link => `[[[${link}]]]()`));
      const innerHtml = marked(tempContent);
      // TODO each package should provide html for the alias
      // default is provided by this package
      previewRender(innerHtml, this.replaceAlias).then((html) => {
        this.innerHtml = html;
      });
    },
    async replaceAlias(aliases) {
      const aliasobjs = [];
      for (let i = 0; i < aliases.length; i++) {
        const alias = aliases[i];
        // const separators = [...alias.matchAll(/[.\/#\@]+/g)];
        // const components = alias.split(/[.\/#\@]+/g);
        // console.log('separators', separators);
        // console.log('components', components);
        // // TODO: account for @ & multiple subdomains
        // // return this.replaceAlias(components[0], components[1], separators[0][0]);
        // const data = await this.$store.dispatch('getAliasData', {
        //   dTypeIdentifier: this.aliases[components[0]].identifier,
        //   separator: separators[0][0],
        //   name: components[1],
        // });

        if (!this.aliascontent[alias]) {
          this.aliascontent[alias] = await this.getAliasData(alias);
        }

        // TODO move this in a utility that knows how to handle each type
        const parts = alias.split('.').slice(2);
        const preview = Object.assign({}, this.aliascontent[alias].content);
        delete preview.typeHash;
        const content = JSON.stringify(preview).replace(/","/g, '", "');
        // TODO fix this - each package needs to implement this
        if (this.aliascontent[alias].dtypeData.name === 'markdown') {
          content = marked(preview.content);
        }
        if (this.aliascontent[alias].dtypeData.name === 'geopoint') {
          if (preview.geonamesid) {
            content = alias.split('.')[1];
          } else {
            content = `geopoint:${alias.split('.')[1]}`;
          }
        }

        // const {uiPackage, component} = await window.getDynamicPackageInternal(
        //   this.aliascontent[alias].dtypeData.name,
        //   'simplehtml',
        // );
        // const content = component;

        const parsed = typePreview(
          this.aliascontent[alias].dtypeData.name,
          content,
          alias,
        );

        if (parts.length === 0) {
          aliasobjs.push(parsed);
        } else {
          let replacement = Object.assign({}, this.aliascontent[alias].content);
          // console.log('replacement', replacement);
          for (let j = 0; j < parts.length; j++) {
            if (replacement) replacement = replacement[parts[j]];
          }
          // console.log('replaceAlias typePreview: replacement, alias', replacement, alias);
          const ssssss = typePreview(this.aliascontent[alias].dtypeData.name, replacement, alias);
          // console.log('ssssss', ssssss);
          aliasobjs.push(ssssss);
        }
      }
      return aliasobjs;
    },
  },
};
</script>
