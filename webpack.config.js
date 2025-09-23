const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Cleans the dist folder before each build
  },
  devtool: 'inline-source-map', // Useful for debugging
  devServer: {
    static: './dist', // Serve files from the dist directory
    hot: true, // Enable Hot Module Replacement
    host: '0.0.0.0', // Listen on all network interfaces
    allowedHosts: 'all', // Allow all hosts for local network access
    https: true, // Enable HTTPS
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Use our index.html as a template
      inject: 'body', // Inject the script into the body
    }),
  ],
};
