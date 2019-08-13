import Vue from 'vue';

export const TYPE_PREVIEW = {
  markdown: (data) => {
    // return ethers.utils.toUtf8String(data.content);
    return data.content;
  },
  account: (data) => {
    return data.addr;
  },
  person: (data) => {
    console.log('TYPE_PREVIEW person', data);
    return data.fullname;
  },
};

export const getUIPackage = async (packageName) => {
  const pack = await import(
    /* webpackChunkName: 'dynamicComponent' */
    /* webpackMode: "lazy" */
    `../../../client/node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.common.js`
  ).catch(console.log);

  if (pack) {
    await import(
      /* webpackChunkName: 'dynamicComponent' */
      /* webpackMode: "lazy" */
      `../../../client/node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.css`
    ).catch(console.log);
  }

  return pack;
};
window.getUIPackage = getUIPackage;

export const setDynamicComponent = (uiPackage, componentType) => {
  console.log('setDynamicComponent', uiPackage, componentType);
  const {getComponent} = uiPackage;
  const component = getComponent(componentType);
  console.log('componentName', component.name, component);
  Vue.component(component.name, component);
  return component;
};
window.setDynamicComponent = setDynamicComponent;

export const getDynamicPackageInternal = async (dtypeName, componentType) => {
  let uiPackage = await getUIPackage(dtypeName);

  if (!uiPackage) {
    uiPackage = await getUIPackage('default');
  }

  const component = setDynamicComponent(uiPackage, componentType);

  return {uiPackage, component};
};
window.getDynamicPackageInternal = getDynamicPackageInternal;
