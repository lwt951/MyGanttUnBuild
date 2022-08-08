const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        // src下的文件夾
        assets: '@/assets',
        components: '@/components',
        views: '@/views'
      }
    }
  }
});
