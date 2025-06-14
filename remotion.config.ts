// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";

Config.setMaxTimelineTracks(200);
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      fallback: {
        ...(currentConfiguration.resolve?.fallback || {}),  // 保留现有的 fallbacks
        "path": false,                                      // 告诉 Webpack 'path' 模块在客户端不可用
        "fs": false                                         // 告诉 Webpack 'fs' 模块 (包括 fs/promises) 在客户端不可用
      },
    },
  };
});
