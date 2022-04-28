/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  css: {
    loaderOptions: {
      less: {
        prependData: `@import "./src/style/theme.less";`,
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {
            hack: `true; @import "./src/style/antd-theme.less";`,
          },
        },
      },
    },
  },
  configureWebpack: {
    output: {
      filename: "[name]-[hash:8].js",
      chunkFilename: "[name]-[hash:8].js",
    },
    resolve: {
      symlinks: false,
      alias: {
        commonui: path.resolve(__dirname, "src/commonui"),
        vue: path.resolve("./node_modules/vue"),
      },
    },
  },
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false,
    },
  },
};
