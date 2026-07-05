const path = require("path");

/**
 * Webpack configuration for the headless round-trip test harness.
 *
 * Bundles test/roundtrip.entry.ts (block definitions + SML generator + the
 * SML->blocks parser) for Node, so test/run_roundtrip.js can exercise
 * text -> blocks -> text conversions without a browser.
 */
module.exports = {
  mode: "development",
  target: "node",
  entry: {
    roundtrip: { import: "./test/roundtrip.entry.ts" },
  },
  devtool: false,
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "test", "dist"),
    library: { type: "commonjs2" },
    assetModuleFilename: "images/[name][ext]",
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
