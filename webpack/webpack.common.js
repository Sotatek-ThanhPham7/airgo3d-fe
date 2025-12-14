const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const BUILD_DIR = path.resolve(__dirname, "../build");
const SRC_DIR = path.resolve(__dirname, "../src");

module.exports = {
  entry: path.join(SRC_DIR, "index.tsx"),
  output: {
    path: BUILD_DIR,
    filename: "[contenthash].bundle.js",
    publicPath: "/",
    clean: true,
  },
  resolve: {
    mainFields: ["browser", "main", "module"],
    extensions: [".ts", ".tsx", ".js", ".json"],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new Dotenv({
      // Automatically loads .env file from root
      // Override with .env.production or .env.development if they exist
      safe: false, // Set to true to use .env.example as template
      systemvars: true, // Load system environment variables (takes precedence)
      defaults: false, // Load .env.defaults if it exists
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, "../public/index.html"),
    }),
    new ESLintPlugin({
      extensions: ["ts", "tsx", "js"],
      emitWarning: true,
      exclude: ["node_modules", "webpack"],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "../public"),
    },
    hot: true,
    historyApiFallback: true,
    host: "0.0.0.0",
    port: 3001,
    open: true,
    client: {
      overlay: true,
      progress: true,
    },
  },
};
