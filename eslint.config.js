const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const reactNativePlugin = require("eslint-plugin-react-native");

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      prettier: prettierPlugin,
      "react-native": reactNativePlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "react-native/no-unused-styles": "error",
    },
  },
]);
