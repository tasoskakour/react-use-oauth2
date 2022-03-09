function injectEnv(definitions) {
  const env = 'process.env';

  if (!definitions[env]) {
    return {
      ...definitions,
      [env]: JSON.stringify(
        Object.fromEntries(
          Object.entries(definitions)
            .filter(([key]) => key.startsWith(env))
            .map(([key, value]) => [key.substring(env.length + 1), JSON.parse(value)]),
        ),
      ),
    };
  }
  return definitions;
}

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    {name: "@storybook/addon-essentials",options: {
      // https://github.com/storybookjs/storybook/issues/15901
      // docs not compatible with webpack 5.
      docs: false,
  },},
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  // https://github.com/storybookjs/storybook/issues/17336#issuecomment-1022153682
  webpackFinal: async config => {
    const definePlugin = config.plugins.find(
      ({ constructor }) => constructor && constructor.name === 'DefinePlugin',
    );
    if (definePlugin) {
      definePlugin.definitions = injectEnv(definePlugin.definitions);
    }

    return config;
  },
}