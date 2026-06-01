module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@features': './src/features',
            '@services': './src/services',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@theme': './src/theme',
            '@localization': './src/localization',
            '@types': './src/types',
            '@api': './src/api',
            '@animations': './src/animations',
            '@assets': './src/assets',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
