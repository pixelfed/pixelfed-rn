module.exports = (api) => {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            src: './src',
            '@state': './src/state',
            '@components': './src/components',
            '@requests': './src/requests.js',
          },
        },
      ],
    ],
  }
}
