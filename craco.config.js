const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@primary-color": '#0037ff',
              "@text-color": "#333333",
              "@layout-body-background": "#ffffff",
              "@layout-header-background": "#000",
              "@layout-header-color": "#ffffff",
              "@layout-header-padding": "0 10px",
              "@btn-border-radius-base": "5px",
              "@form-vertical-label-padding": "0",
              "@form-item-label-height": "22px",
              "@form-item-margin-bottom": "12px"
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ]
};