<template>
  <v-flex xs12>
    <AbiIO
      v-model="data"
      v-for="(abi, i) in abis" :key="i"
      :abi="abi"
      :validator="validator"
    />
  </v-flex>
</template>

<script>
import {VFlex} from 'vuetify/lib';
import AbiIO from './abi/AbiIO';
import {validateArg} from './abi/utils.js';

export default {
  name: 'DefaultEdit',
  props: ['value', 'dtypeAbi'],
  components: {AbiIO, VFlex},
  data() {
    return {data: this.value, validator: validateArg};
  },
  computed: {
    abis() {
      return [this.dtypeAbi];
    },
  },
  mounted() {
    this.data = this.value;
  },
  watch: {
    value() {
      this.data = this.value;
    },
    data() {
      if (JSON.stringify(this.data) != JSON.stringify(this.value)) {
        this.$emit('input', this.data);
      }
    }
  },
};
</script>
