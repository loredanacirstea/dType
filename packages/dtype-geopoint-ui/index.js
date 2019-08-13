import GeopointView from './src/components/GeopointView.vue';
import GeopointEdit from './src/components/GeopointEdit.vue';

export {GeopointView, GeopointEdit};

const componentMap = {
  view: GeopointView,
  edit: GeopointEdit,
};

export const getComponent = (type) => {
  return componentMap[type] || GeopointView;
};
