const path = require("path");

/**
 * Webpack configuration for Visual SML.
 *
 * Supports BOTH JavaScript and TypeScript sources: every `.ts` and `.js`
 * file under `src` is handed to `ts-loader` (TypeScript's `allowJs` option
 * lets it transpile plain JavaScript too), so the project can be migrated
 * file by file without breaking the build.
 */
module.exports = {
  mode: "development",
  entry: {
    // Entry points were migrated from `.js` to `.ts`. `resolve.extensions`
    // below means the extension does not need to be written here, but we keep
    // it explicit for clarity.
    tarsius: { import: "./src/tarsius.ts" },
    assets: { import: "./src/assets/assets_loader.ts" },
  },
  devtool: "source-map",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "docs"),
    library: "[name]",
    assetModuleFilename: "images/[name][ext]",
  },

  module: {
    rules: [
      {
        // TypeScript AND JavaScript are both compiled through ts-loader.
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
        type: "asset/resource",
      },
    ],
  },

  resolve: {
    // Resolve TypeScript first, then fall back to JavaScript. This lets
    // extensionless imports (e.g. `import "./core/blocks/constants"`) find
    // the migrated `.ts` files transparently.
    extensions: [".ts", ".js"],
  },

  devServer: {
    static: "./docs",
  },
};
