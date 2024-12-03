const { override, addWebpackPlugin } = require("customize-cra");
const PerspectivePlugin = require("@finos/perspective-webpack-plugin");

module.exports = override(addWebpackPlugin(new PerspectivePlugin()));
