module.exports = (api) => {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            src: './src',
            '@state': './src/state',
            '@hooks': './src/hooks',
            '@components': './src/components',
          },
        }
      ],
    ],
  }
}